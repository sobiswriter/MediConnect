'use client';
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Appointment {
    id: string;
    doctorName: string;
    doctorSpecialty: string;
    appointmentDateTime: Timestamp;
    type: 'Online' | 'In-Person';
}

export default function PatientAppointmentsPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchAppointments = async () => {
            setLoading(true);
            try {
                // Simplified query to avoid composite index, sorting is done client-side
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
                    } as Appointment;
                }));

                // Sort client-side since orderBy was removed from the query
                fetchedAppointments.sort((a, b) => b.appointmentDateTime.toMillis() - a.appointmentDateTime.toMillis());

                setAppointments(fetchedAppointments);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [user]);
    
    const appointmentDates = appointments.map(a => a.appointmentDateTime.toDate());
    const upcomingAppointments = appointments.filter(a => a.appointmentDateTime.toDate() >= new Date());

    if (loading) {
        return (
             <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                        <CardContent><Skeleton className="h-72 w-full" /></CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
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
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Appointments</CardTitle>
                        <CardDescription>Your upcoming and past appointments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="multiple"
                            selected={appointmentDates}
                            defaultMonth={new Date()}
                            className="p-0"
                            classNames={{
                                day_selected: "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent/90",
                                day_today: "bg-primary/20 text-primary-foreground"
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
             <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming</CardTitle>
                         <CardDescription>You have {upcomingAppointments.length} upcoming appointments.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(appt => (
                                <div key={appt.id} className="p-3 bg-muted rounded-lg">
                                    <p className="font-semibold">{appt.doctorName}</p>
                                    <p className="text-sm text-muted-foreground">{appt.doctorSpecialty}</p>
                                    <p className="text-sm font-medium mt-1">
                                        {appt.appointmentDateTime.toDate().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <Badge variant={appt.type === 'Online' ? 'default' : 'secondary'} className={`mt-2 ${appt.type === 'Online' ? 'bg-accent text-accent-foreground' : ''}`}>{appt.type}</Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No upcoming appointments.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
