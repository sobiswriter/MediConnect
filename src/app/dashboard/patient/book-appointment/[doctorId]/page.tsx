
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp, runTransaction, serverTimestamp, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parse } from 'date-fns';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { PaymentModal } from '@/components/shared/PaymentModal';

interface DoctorProfile {
    id: string;
    name: string;
    specialty: string;
    consultationFee: number;
}

interface AvailabilitySlot {
    id: string;
    doctorId: string;
    date: Timestamp;
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    isBooked: boolean;
}

export default function BookAppointmentPage() {
    const params = useParams();
    const router = useRouter();
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const doctorId = params.doctorId as string;

    const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [date, setDate] = useState<Date | undefined>();
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
    const [reason, setReason] = useState('');
    const [type, setType] = useState<'Online' | 'In-Person'>('Online');
    const [loading, setLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        if (!doctorId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Doctor Profile
                const doctorDocRef = doc(db, 'doctorProfiles', doctorId);
                const doctorDocSnap = await getDoc(doctorDocRef);
                if (doctorDocSnap.exists()) {
                    const data = doctorDocSnap.data();
                    setDoctor({
                        id: doctorDocSnap.id,
                        name: data.name,
                        specialty: data.specialty,
                        consultationFee: data.consultationFee || 0,
                    });
                } else {
                    toast({ title: "Error", description: "Doctor not found.", variant: "destructive" });
                    router.push('/dashboard/patient/find-doctor');
                    return;
                }

                // Fetch Availability
                const availabilityQuery = query(
                    collection(db, 'doctorAvailability'),
                    where('doctorId', '==', doctorId)
                );
                const availabilitySnapshot = await getDocs(availabilityQuery);
                const now = new Date();

                const availableSlots = availabilitySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as AvailabilitySlot))
                    .filter(slot => {
                        const slotDate = slot.date.toDate();
                        return !slot.isBooked && slotDate > now;
                    });
                
                // Sort client-side
                availableSlots.sort((a,b) => a.date.toMillis() - b.date.toMillis() || a.startTime.localeCompare(b.startTime));

                setAvailability(availableSlots);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ title: "Error", description: "Failed to fetch doctor's availability.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [doctorId, router, toast]);

    const availabilityByDate = useMemo(() => {
        return availability.reduce((acc, slot) => {
            const dateStr = format(slot.date.toDate(), 'yyyy-MM-dd');
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(slot);
            return acc;
        }, {} as Record<string, AvailabilitySlot[]>);
    }, [availability]);

    const availableDates = useMemo(() => Object.keys(availabilityByDate).map(d => parse(d, 'yyyy-MM-dd', new Date())), [availabilityByDate]);
    
    const selectedDateString = date ? format(date, 'yyyy-MM-dd') : '';
    const slotsForSelectedDate = availabilityByDate[selectedDateString] || [];
    
    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':');
        const h = parseInt(hour);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const formattedHour = ((h + 11) % 12 + 1);
        return `${formattedHour}:${minute} ${suffix}`;
    }

    const handleProceedToPayment = () => {
        if (!user || !userProfile || !selectedSlot || !reason || !type) {
            toast({ title: "Incomplete Information", description: "Please select a time slot and provide a reason for your visit.", variant: "destructive" });
            return;
        }
        setIsPaymentModalOpen(true);
    };

    const handleBooking = async () => {
        if (!user || !userProfile || !selectedSlot) {
            throw new Error("Booking information is missing.");
        }
        setIsBooking(true);

        const availabilitySlotRef = doc(db, 'doctorAvailability', selectedSlot.id);
        const newAppointmentRef = doc(collection(db, 'appointments'));
        
        try {
            await runTransaction(db, async (transaction) => {
                const availabilitySlotDoc = await transaction.get(availabilitySlotRef);
                if (!availabilitySlotDoc.exists() || availabilitySlotDoc.data()?.isBooked) {
                    throw new Error("This slot is no longer available. Please select another time.");
                }
                
                const appointmentDateTime = selectedSlot.date.toDate();

                transaction.update(availabilitySlotRef, {
                    isBooked: true,
                    bookedByPatientId: user.uid,
                    updatedAt: serverTimestamp(),
                });

                transaction.set(newAppointmentRef, {
                    patientId: user.uid,
                    patientName: userProfile.displayName,
                    patientEmail: userProfile.email,
                    doctorId: selectedSlot.doctorId,
                    availabilitySlotId: selectedSlot.id,
                    appointmentDateTime: Timestamp.fromDate(appointmentDateTime),
                    reasonForVisit: reason,
                    type: type,
                    status: 'booked',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            });

            toast({ title: "Success!", description: "Your appointment has been booked." });
            router.push('/dashboard/patient/appointments');
        } catch (error: any) {
            console.error("Booking failed:", error);
            // Re-throw the error to be caught by the payment modal
            throw error;
        } finally {
            setIsBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="grid lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-24 mb-2" />
                            <Skeleton className="h-[280px] w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                        <CardContent>
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <Skeleton className="h-48 w-full rounded-lg" />
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="grid lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://placehold.co/128x128.png`} alt={doctor?.name} />
                                <AvatarFallback>{doctor?.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>Book Appointment with {doctor?.name}</CardTitle>
                                <CardDescription>{doctor?.specialty}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Label>Select a Date</Label>
                            <div className="flex justify-center pt-2">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => { setDate(d); setSelectedSlot(null); }}
                                    disabled={(d) => !availableDates.some(ad => ad.getTime() === d.getTime())}
                                    modifiers={{ available: availableDates }}
                                    modifiersClassNames={{ available: 'bg-primary/20' }}
                                    className="rounded-md border"
                                    classNames={{
                                        day_selected: "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent/90",
                                        day_today: "bg-primary text-primary-foreground"
                                    }}
                                />
                            </div>
                            {date && (
                                <div className="mt-6">
                                    <CardHeader className="p-0 mb-4">
                                        <CardTitle>Select a Time Slot</CardTitle>
                                        <CardDescription>Available slots for {format(date, 'MMMM d, yyyy')}</CardDescription>
                                    </CardHeader>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {slotsForSelectedDate.length > 0 ? slotsForSelectedDate.map(slot => (
                                            <Button 
                                                key={slot.id} 
                                                variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                                                className={selectedSlot?.id === slot.id ? 'bg-accent text-accent-foreground' : ''}
                                                onClick={() => setSelectedSlot(slot)}
                                            >
                                                {formatTime(slot.startTime)}
                                            </Button>
                                        )) : <p className="text-sm text-muted-foreground col-span-full">No available slots for this day.</p>}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Appointment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {doctor && <p><strong>Doctor:</strong> {doctor.name}</p>}
                            {doctor && <p><strong>Fee:</strong> ${doctor.consultationFee}</p>}
                            {selectedSlot && date ? (
                                <p><strong>Time:</strong> {format(selectedSlot.date.toDate(), 'EEEE, MMMM d')} at {formatTime(selectedSlot.startTime)}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Please select a date and time.</p>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Visit</Label>
                                <Textarea id="reason" placeholder="e.g. Annual check-up, specific symptom..." value={reason} onChange={e => setReason(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Appointment Type</Label>
                                <RadioGroup value={type} onValueChange={(value: 'Online' | 'In-Person') => setType(value)} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Online" id="online" />
                                        <Label htmlFor="online">Online</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="In-Person" id="in-person" />
                                        <Label htmlFor="in-person">In-Person</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <Button onClick={handleProceedToPayment} disabled={!selectedSlot || !reason || !type || isBooking} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                {isBooking ? "Booking..." : "Proceed to Payment"}
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>How to Prepare</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0"/>
                                <span>For online visits, please ensure you have a stable internet connection.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0"/>
                                <span>Have a list of your current medications and any questions you have for the doctor.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0"/>
                                <span>You can manage this appointment from your dashboard after booking.</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <Image src="https://placehold.co/600x400.png" width={600} height={400} alt="A welcoming doctor's office" data-ai-hint="doctor office" />
                        </CardContent>
                    </Card>
                </div>
            </div>
            {doctor && (
                <PaymentModal 
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirmBooking={handleBooking}
                    amount={doctor.consultationFee}
                />
            )}
        </>
    )
}
