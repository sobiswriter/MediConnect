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

interface DoctorProfile {
    id: string;
    name: string;
    specialty: string;
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
    const [booking, setBooking] = useState(false);

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
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const availableSlots = availabilitySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as AvailabilitySlot))
                    .filter(slot => {
                        const slotDate = slot.date.toDate();
                        return !slot.isBooked && slotDate >= today;
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

    const handleBooking = async () => {
        if (!user || !userProfile || !selectedSlot || !reason || !type) {
            toast({ title: "Incomplete Information", description: "Please select a time slot and provide a reason for your visit.", variant: "destructive" });
            return;
        }
        setBooking(true);

        const availabilitySlotRef = doc(db, 'doctorAvailability', selectedSlot.id);
        const newAppointmentRef = doc(collection(db, 'appointments'));
        
        try {
            await runTransaction(db, async (transaction) => {
                const availabilitySlotDoc = await transaction.get(availabilitySlotRef);
                if (!availabilitySlotDoc.exists() || availabilitySlotDoc.data()?.isBooked) {
                    throw new Error("This slot is no longer available. Please select another time.");
                }
                
                const [hours, minutes] = selectedSlot.startTime.split(':').map(Number);
                const appointmentDateTime = selectedSlot.date.toDate();
                appointmentDateTime.setHours(hours, minutes, 0, 0);

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
            toast({ title: "Booking Failed", description: error.message || "An error occurred during booking. Please try again.", variant: "destructive" });
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card><CardHeader><Skeleton className="h-20 w-20 rounded-full" /></CardHeader><CardContent><div className="space-y-2"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-[280px] w-full" /></div></CardContent></Card>
                </div>
                <div>
                    <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
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
                                disabled={(d) => !availableDates.some(ad => ad.getTime() === d.getTime()) || d < new Date(new Date().setHours(0,0,0,0))}
                                modifiers={{ available: availableDates }}
                                modifiersClassNames={{ available: 'bg-primary/20' }}
                                className="rounded-md border"
                                classNames={{
                                    day_selected: "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent/90",
                                    day_today: "bg-primary text-primary-foreground"
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
                {date && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Select a Time Slot</CardTitle>
                            <CardDescription>Available slots for {format(date, 'MMMM d, yyyy')}</CardDescription>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>
                )}
            </div>
            <div className="lg:col-span-1 sticky top-20">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Appointment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {doctor && <p><strong>Doctor:</strong> {doctor.name}</p>}
                        {selectedSlot && date ? (
                            <p><strong>Time:</strong> {format(date, 'EEEE, MMMM d')} at {formatTime(selectedSlot.startTime)}</p>
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
                         <Button onClick={handleBooking} disabled={!selectedSlot || !reason || !type || booking} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            {booking ? "Booking..." : "Confirm Booking"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
