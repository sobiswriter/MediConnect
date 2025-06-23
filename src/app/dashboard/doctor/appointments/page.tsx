
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, Timestamp, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    patientAvatar?: string;
    patientInitials: string;
    appointmentDateTime: Timestamp;
    type: 'Online' | 'In-Person';
    status: 'booked' | 'cancelled' | 'completed';
    availabilitySlotId?: string;
}

export default function DoctorAppointmentsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentsByDate, setAppointmentsByDate] = useState<{ [key: string]: Appointment[] }>({});
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<string | null>(null);

    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const q = query(collection(db, 'appointments'), where('doctorId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            
            const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

            const fetchedAppointments = querySnapshot.docs.map((appointmentDoc) => {
                const appointmentData = appointmentDoc.data();
                const patientName = appointmentData.patientName || 'Unknown Patient';
                
                return {
                    id: appointmentDoc.id,
                    patientId: appointmentData.patientId,
                    patientName,
                    patientInitials: getInitials(patientName),
                    appointmentDateTime: appointmentData.appointmentDateTime,
                    type: appointmentData.type || 'Online',
                    status: appointmentData.status || 'booked',
                    availabilitySlotId: appointmentData.availabilitySlotId,
                } as Appointment;
            });
            
            fetchedAppointments.sort((a, b) => a.appointmentDateTime.toDate().getTime() - b.appointmentDateTime.toDate().getTime());

            setAppointments(fetchedAppointments);
            
            const now = new Date();
            const upcoming = fetchedAppointments.filter(
                appt => appt.appointmentDateTime.toDate() >= now && appt.status === 'booked'
            );
            setUpcomingAppointments(upcoming);

            const groupedAppointments = fetchedAppointments.reduce((acc, curr) => {
                const dateStr = format(curr.appointmentDateTime.toDate(), 'yyyy-MM-dd');
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


    const selectedDateString = date ? format(date, 'yyyy-MM-dd') : '';
    const selectedAppointments = appointmentsByDate[selectedDateString] || [];
    const appointmentDates = Object.keys(appointmentsByDate).map(d => parse(d, 'yyyy-MM-dd', new Date()));

    if (loading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/5" />
                        <Skeleton className="h-4 w-4/5" />
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                        <Skeleton className="w-full h-[280px] rounded-md" />
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
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
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Appointments Calendar</CardTitle>
                    <CardDescription>Select a date to view your schedule for that day.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="flex justify-center">
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
                    </div>
                    <div className="pt-2">
                        <h3 className="text-lg font-semibold mb-4">
                            Schedule for {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Today'}
                        </h3>
                        <div className="space-y-4">
                            {selectedAppointments.length > 0 ? selectedAppointments.map((appt) => (
                                <div key={appt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={appt.patientAvatar} alt={appt.patientName} />
                                            <AvatarFallback>{appt.patientInitials}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{appt.patientName}</p>
                                            <p className="text-sm text-muted-foreground">{appt.appointmentDateTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={appt.status !== 'booked' ? 'destructive' : (appt.type === 'Online' ? 'default' : 'secondary')} className={appt.type === 'Online' && appt.status === 'booked' ? 'bg-accent text-accent-foreground' : ''}>{appt.status}</Badge>
                                        {appt.status === 'booked' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" disabled={cancelling === appt.id}>
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
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No appointments scheduled for this day.</p>
                            )}
                        </div>
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
                                <div className="flex items-center gap-3">
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
                                <div className="flex items-center gap-2">
                                     <Badge variant={appt.type === 'Online' ? 'default' : 'secondary'} className={appt.type === 'Online' ? 'bg-accent text-accent-foreground' : ''}>{appt.type}</Badge>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={cancelling === appt.id}>
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
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-8">You have no upcoming appointments.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
