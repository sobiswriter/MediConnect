'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, Timestamp, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parse, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Mars, Venus } from 'lucide-react';
import Image from 'next/image';


interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    patientAvatar?: string;
    patientInitials: string;
    patientGender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    patientDob?: string;
    appointmentDateTime: Timestamp;
    type: 'Online' | 'In-Person';
    status: 'booked' | 'cancelled' | 'completed';
    availabilitySlotId?: string;
    reasonForVisit?: string;
}

export default function DoctorAppointmentsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentsByDate, setAppointmentsByDate] = useState<{ [key: string]: Appointment[] }>({});
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<string | null>(null);
    const [completing, setCompleting] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const calculateAge = (dob: string | undefined): number | null => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const q = query(collection(db, 'appointments'), where('doctorId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            
            const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

            const fetchedAppointments = await Promise.all(querySnapshot.docs.map(async (appointmentDoc) => {
                const appointmentData = appointmentDoc.data();
                const patientName = appointmentData.patientName || 'Unknown Patient';
                const patientId = appointmentData.patientId;

                let patientProfileData: any = {};
                if (patientId) {
                    const patientProfileRef = doc(db, 'patientProfiles', patientId);
                    const patientProfileSnap = await getDoc(patientProfileRef);
                    if (patientProfileSnap.exists()) {
                        patientProfileData = patientProfileSnap.data();
                    }
                }
                
                return {
                    id: appointmentDoc.id,
                    patientId: appointmentData.patientId,
                    patientName,
                    patientInitials: getInitials(patientName),
                    patientGender: patientProfileData.gender,
                    patientDob: patientProfileData.dateOfBirth,
                    appointmentDateTime: appointmentData.appointmentDateTime,
                    type: appointmentData.type || 'Online',
                    status: appointmentData.status || 'booked',
                    availabilitySlotId: appointmentData.availabilitySlotId,
                    reasonForVisit: appointmentData.reasonForVisit || 'No reason provided.'
                } as Appointment;
            }));
            
            fetchedAppointments.sort((a, b) => a.appointmentDateTime.toDate().getTime() - b.appointmentDateTime.toDate().getTime());

            setAppointments(fetchedAppointments);
            
            const now = new Date();
            const upcoming = fetchedAppointments.filter(
                appt => appt.appointmentDateTime.toDate() >= now && appt.status === 'booked'
            );
            setUpcomingAppointments(upcoming);

            const completed = fetchedAppointments.filter(appt => appt.status === 'completed');
            completed.sort((a, b) => b.appointmentDateTime.toDate().getTime() - a.appointmentDateTime.toDate().getTime());
            setCompletedAppointments(completed);

            const groupedAppointments = fetchedAppointments.reduce((acc, curr) => {
                const dateStr = format(startOfDay(curr.appointmentDateTime.toDate()), 'yyyy-MM-dd');
                if (!acc[dateStr]) {
                    acc[dateStr] = [];
                }
                acc[dateStr].push(curr);
                return acc;
            }, {} as { [key: string]: Appointment[] });

            setAppointmentsByDate(groupedAppointments);
        } catch (error) {
            console.error("Error fetching appointments: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user]);

    const handleCancelAppointment = async (appointmentId: string, availabilitySlotId: string | undefined) => {
        if (!availabilitySlotId) {
            toast({ title: "Error", description: "Cannot cancel this appointment, availability info is missing.", variant: "destructive" });
            return;
        }
        setCancelling(appointmentId);

        const appointmentRef = doc(db, 'appointments', appointmentId);
        const availabilityRef = doc(db, 'doctorAvailability', availabilitySlotId);

        try {
            await runTransaction(db, async (transaction) => {
                const availabilityDoc = await transaction.get(availabilityRef);
                if (!availabilityDoc.exists()) {
                    throw new Error("Availability slot not found. It may have been deleted.");
                }

                transaction.update(appointmentRef, {
                    status: 'cancelled',
                    updatedAt: serverTimestamp(),
                });

                transaction.update(availabilityRef, {
                    isBooked: false,
                    bookedByPatientId: null,
                    updatedAt: serverTimestamp(),
                });
            });

            toast({ title: "Success", description: "Appointment cancelled successfully." });
            await fetchAppointments(); // Re-fetch to get the latest state
        } catch (error: any) {
            console.error("Error cancelling appointment: ", error);
            toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
        } finally {
            setCancelling(null);
        }
    };

    const handleCompleteAppointment = async (appointmentId: string) => {
        setCompleting(appointmentId);
        const appointmentRef = doc(db, 'appointments', appointmentId);
        try {
            await updateDoc(appointmentRef, {
                status: 'completed',
                updatedAt: serverTimestamp(),
            });
            toast({ title: "Success", description: "Appointment marked as completed." });
            await fetchAppointments();
        } catch (error: any) {
            console.error("Error completing appointment: ", error);
            toast({ title: "Error", description: "Failed to mark appointment as completed.", variant: "destructive" });
        } finally {
            setCompleting(null);
        }
    };


    const selectedDateString = date ? format(startOfDay(date), 'yyyy-MM-dd') : '';
    const selectedAppointments = appointmentsByDate[selectedDateString] || [];
    const appointmentDates = Object.keys(appointmentsByDate).map(d => parse(d, 'yyyy-MM-dd', new Date()));

    if (loading) {
        return (
            <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/5" />
                            <Skeleton className="h-4 w-4/5" />
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Skeleton className="w-full h-[280px] rounded-md" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-2/5" />
                            <Skeleton className="h-4 w-3/5" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-2/5" />
                            <Skeleton className="h-4 w-3/5" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-2/5" />
                            <Skeleton className="h-4 w-3/5" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <Dialog onOpenChange={(open) => !open && setSelectedAppointment(null)}>
            <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointments Calendar</CardTitle>
                            <CardDescription>Select a date to view your schedule for that day.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                modifiers={{ appointments: appointmentDates }}
                                modifiersClassNames={{ appointments: 'bg-primary/20' }}
                                className="rounded-md border"
                                classNames={{
                                    day_selected: "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent/90",
                                    day_today: "bg-primary text-primary-foreground"
                                }}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Completed Appointments</CardTitle>
                            <CardDescription>A record of your past consultations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {completedAppointments.length > 0 ? completedAppointments.map((appt) => (
                                    <DialogTrigger asChild key={appt.id}>
                                        <div 
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/80"
                                            onClick={() => setSelectedAppointment(appt)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={appt.patientAvatar} alt={appt.patientName} />
                                                    <AvatarFallback>{appt.patientInitials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{appt.patientName}</p>
                                                    <p className="text-sm text-muted-foreground">{format(appt.appointmentDateTime.toDate(), "PPP")}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">Completed</Badge>
                                        </div>
                                    </DialogTrigger>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No completed appointments yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Schedule for {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Today'}
                            </CardTitle>
                            <CardDescription>Appointments scheduled for the selected date.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {selectedAppointments.length > 0 ? selectedAppointments.map((appt) => {
                                    const isAppointmentInPast = appt.appointmentDateTime.toDate() < new Date();
                                    return (
                                    <div key={appt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <DialogTrigger asChild>
                                            <div className="flex items-center gap-3 flex-grow cursor-pointer" onClick={() => setSelectedAppointment(appt)}>
                                                <Avatar>
                                                    <AvatarImage src={appt.patientAvatar} alt={appt.patientName} />
                                                    <AvatarFallback>{appt.patientInitials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{appt.patientName}</p>
                                                    <p className="text-sm text-muted-foreground">{appt.appointmentDateTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </DialogTrigger>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={appt.status === 'cancelled' ? 'destructive' : appt.status === 'completed' ? 'secondary' : 'default'} className={appt.type === 'Online' && appt.status === 'booked' ? 'bg-accent text-accent-foreground' : ''}>{appt.status}</Badge>
                                            {appt.status === 'booked' && (
                                                <>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" disabled={cancelling === appt.id || completing === appt.id}>
                                                                {cancelling === appt.id ? '...' : 'Cancel'}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will cancel the appointment and notify the patient.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Go Back</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleCancelAppointment(appt.id, appt.availabilitySlotId)}>Confirm Cancellation</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span tabIndex={0}>
                                                                    <Button variant="outline" size="sm" onClick={() => isAppointmentInPast && handleCompleteAppointment(appt.id)} disabled={completing === appt.id || cancelling === appt.id || !isAppointmentInPast}>
                                                                        {completing === appt.id ? '...' : 'Complete'}
                                                                    </Button>
                                                                </span>
                                                            </TooltipTrigger>
                                                            {!isAppointmentInPast && (
                                                                <TooltipContent>
                                                                    <p>Cannot complete a future appointment.</p>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No appointments scheduled for this day.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Upcoming Appointments</CardTitle>
                            <CardDescription>A complete list of your upcoming consultations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingAppointments.length > 0 ? upcomingAppointments.map((appt) => (
                                    <div key={appt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <DialogTrigger asChild>
                                            <div className="flex items-center gap-3 flex-grow cursor-pointer" onClick={() => setSelectedAppointment(appt)}>
                                                <Avatar>
                                                    <AvatarImage src={appt.patientAvatar} alt={appt.patientName} />
                                                    <AvatarFallback>{appt.patientInitials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{appt.patientName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(appt.appointmentDateTime.toDate(), "PPPPp")}
                                                    </p>
                                                </div>
                                            </div>
                                        </DialogTrigger>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={appt.type === 'Online' ? 'default' : 'secondary'} className={appt.type === 'Online' ? 'bg-accent text-accent-foreground' : ''}>{appt.type}</Badge>
                                            {appt.status === 'booked' && (
                                                <>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" disabled={cancelling === appt.id || completing === appt.id}>
                                                                {cancelling === appt.id ? '...' : 'Cancel'}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will cancel the appointment and notify the patient.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Go Back</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleCancelAppointment(appt.id, appt.availabilitySlotId)}>Confirm Cancellation</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span tabIndex={0}>
                                                                <Button variant="outline" size="sm" disabled>
                                                                    Complete
                                                                </Button>
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Cannot complete a future appointment.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    </TooltipProvider>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">You have no upcoming appointments.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {selectedAppointment && (
                 <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Appointment with {selectedAppointment.patientName}</DialogTitle>
                        <DialogDescription>
                            {format(selectedAppointment.appointmentDateTime.toDate(), "EEEE, MMMM d, yyyy 'at' p")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={selectedAppointment.patientAvatar} />
                                <AvatarFallback>{selectedAppointment.patientInitials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-lg">{selectedAppointment.patientName}</p>
                                <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-4 w-4" />
                                        <span>{calculateAge(selectedAppointment.patientDob) ? `${calculateAge(selectedAppointment.patientDob)} years old` : 'Age N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 capitalize">
                                        {selectedAppointment.patientGender === 'male' ? <Mars className="h-4 w-4" /> : <Venus className="h-4 w-4" />}
                                        <span>{selectedAppointment.patientGender || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Reason for Visit</h4>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md min-h-[60px]">
                                {selectedAppointment.reasonForVisit}
                            </p>
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    )
}
