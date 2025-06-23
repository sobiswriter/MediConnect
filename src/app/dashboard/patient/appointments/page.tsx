
'use client';
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, Timestamp, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Appointment {
    id: string;
    doctorName: string;
    doctorSpecialty: string;
    appointmentDateTime: Timestamp;
    type: 'Online' | 'In-Person';
    status: 'booked' | 'cancelled' | 'completed';
    availabilitySlotId?: string;
}

export default function PatientAppointmentsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<string | null>(null);

    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'appointments'),
                where('patientId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);

            const fetchedAppointments = await Promise.all(querySnapshot.docs.map(async (appointmentDoc) => {
                const appointmentData = appointmentDoc.data();
                const doctorProfileRef = doc(db, 'doctorProfiles', appointmentData.doctorId);
                const doctorProfileSnap = await getDoc(doctorProfileRef);
                const doctorName = doctorProfileSnap.exists() ? doctorProfileSnap.data().name : 'Unknown Doctor';
                const doctorSpecialty = doctorProfileSnap.exists() ? doctorProfileSnap.data().specialty : 'N/A';

                return {
                    id: appointmentDoc.id,
                    doctorName,
                    doctorSpecialty,
                    appointmentDateTime: appointmentData.appointmentDateTime,
                    type: appointmentData.type || 'Online',
                    status: appointmentData.status || 'booked',
                    availabilitySlotId: appointmentData.availabilitySlotId,
                } as Appointment;
            }));

            fetchedAppointments.sort((a, b) => b.appointmentDateTime.toMillis() - a.appointmentDateTime.toMillis());
            setAppointments(fetchedAppointments);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if(user) {
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
                    throw new Error("Availability slot not found. It may have been deleted by the doctor.");
                }

                transaction.update(appointmentRef, {
                    status: 'cancelled',
                    updatedAt: serverTimestamp()
                });

                transaction.update(availabilityRef, {
                    isBooked: false,
                    bookedByPatientId: null,
                    updatedAt: serverTimestamp()
                });
            });

            toast({ title: "Success", description: "Appointment cancelled successfully." });
            await fetchAppointments();
        } catch (error: any) {
            console.error("Error cancelling appointment: ", error);
            toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
        } finally {
            setCancelling(null);
        }
    };
    
    const appointmentDates = appointments.map(a => a.appointmentDateTime.toDate());
    const upcomingAppointments = appointments.filter(a => a.appointmentDateTime.toDate() >= new Date() && a.status === 'booked');
    const pastAppointments = appointments.filter(a => a.appointmentDateTime.toDate() < new Date() || a.status !== 'booked');

    if (loading) {
        return (
             <div className="space-y-6">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                    <CardContent><Skeleton className="h-72 w-full" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                    <CardContent className="space-y-4">
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
                    <CardTitle>My Appointments</CardTitle>
                    <CardDescription>Your upcoming and past appointments are highlighted on the calendar.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="multiple"
                        selected={appointmentDates}
                        defaultMonth={new Date()}
                        className="rounded-md border"
                        classNames={{
                            day_selected: "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent/90",
                            day_today: "bg-primary/20 text-primary-foreground"
                        }}
                    />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Upcoming</CardTitle>
                     <CardDescription>You have {upcomingAppointments.length} upcoming appointments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(appt => (
                            <div key={appt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <p className="font-semibold">{appt.doctorName}</p>
                                    <p className="text-sm text-muted-foreground">{appt.doctorSpecialty}</p>
                                    <p className="text-sm font-medium mt-1">
                                        {appt.appointmentDateTime.toDate().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <Badge variant={appt.type === 'Online' ? 'default' : 'secondary'} className={`mt-2 ${appt.type === 'Online' ? 'bg-accent text-accent-foreground' : ''}`}>{appt.type}</Badge>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={cancelling === appt.id}>
                                            {cancelling === appt.id ? 'Cancelling...' : 'Cancel'}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently cancel your appointment.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleCancelAppointment(appt.id, appt.availabilitySlotId)}>Confirm Cancellation</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No upcoming appointments.</p>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                     <CardDescription>Your past and cancelled appointments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pastAppointments.length > 0 ? (
                        pastAppointments.map(appt => (
                            <div key={appt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{appt.doctorName}</p>
                                    <p className="text-sm text-muted-foreground">{appt.doctorSpecialty}</p>
                                    <p className="text-sm font-medium mt-1">
                                        {format(appt.appointmentDateTime.toDate(), "PPPPp")}
                                    </p>
                                </div>
                                <Badge variant={appt.status === 'cancelled' ? 'destructive' : 'secondary'}>{appt.status}</Badge>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No appointment history.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
