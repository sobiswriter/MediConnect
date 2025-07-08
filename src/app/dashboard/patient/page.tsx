
'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, PlusCircle, Video } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  fullDate: Date;
  type: 'Online' | 'In-Person';
  status: 'booked' | 'cancelled' | 'completed';
  avatar: string;
  initials: string;
  isJoinable: boolean;
}

export default function PatientDashboardPage() {
  const { user, userProfile } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const now = new Date();
            // Simplified query to avoid composite index, filtering and sorting is done client-side
            const q = query(
                collection(db, 'appointments'),
                where('patientId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);

            const allAppointments = await Promise.all(querySnapshot.docs.map(async (appointmentDoc) => {
                const data = appointmentDoc.data();
                const doctorProfileSnap = await getDoc(doc(db, 'doctorProfiles', data.doctorId));
                const doctorData = doctorProfileSnap.exists() ? doctorProfileSnap.data() : { name: 'Dr. Unknown', specialty: 'N/A' };
                
                const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
                const appointmentDate = data.appointmentDateTime.toDate();

                return {
                    id: appointmentDoc.id,
                    doctor: doctorData.name,
                    specialty: doctorData.specialty,
                    date: '', // Will be recalculated
                    fullDate: appointmentDate,
                    type: data.type || 'Online',
                    status: data.status || 'booked',
                    avatar: 'https://placehold.co/100x100.png',
                    initials: getInitials(doctorData.name),
                    isJoinable: false, // will be recalculated
                };
            }));
            
            const appointmentsData = allAppointments
                .filter(appt => appt.fullDate >= now && appt.status === 'booked') // Filter for upcoming, booked appointments
                .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime()) // Sort by date ascending
                .map(appt => {
                    const diffMinutes = (appt.fullDate.getTime() - now.getTime()) / (1000 * 60);
                    return {
                        ...appt,
                        date: formatDistanceToNow(appt.fullDate, { addSuffix: true }),
                        isJoinable: diffMinutes <= 15 && diffMinutes >= -15 && appt.type === 'Online',
                    };
                })
                .slice(0, 5); // Get the next 5

            setUpcomingAppointments(appointmentsData);
        } catch (error) {
            console.error("Error fetching appointments: ", error);
        } finally {
            setLoading(false);
        }
    };

    fetchAppointments();
  }, [user]);

  const nextAppointment = upcomingAppointments[0];
  
  if (loading) {
    return (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-9 w-1/2" />
                <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
            </div>
        </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Welcome back, {userProfile?.displayName || 'User'}!</h2>
            
            {nextAppointment ? (
                <Card className="bg-primary/20 border-primary">
                    <CardHeader>
                        <CardTitle>Next Appointment</CardTitle>
                        <CardDescription>You have an upcoming appointment soon.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={nextAppointment.avatar} alt={nextAppointment.doctor} />
                            <AvatarFallback>{nextAppointment.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{nextAppointment.doctor}</p>
                            <p className="text-sm text-muted-foreground">{nextAppointment.specialty}</p>
                            <p className="text-sm font-medium">{nextAppointment.date}</p>
                        </div>
                        </div>
                        <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!nextAppointment.isJoinable}>
                            <Video className="mr-2 h-4 w-4" /> Join Video Call
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>No Upcoming Appointments</CardTitle>
                        <CardDescription>Your schedule is clear. Ready to book your next check-up?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Link href="/dashboard/patient/find-doctor">
                                <PlusCircle className="mr-2 h-4 w-4" /> Book a New Appointment
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <div >
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Here are your next scheduled appointments.</CardDescription>
                </div>
                <Button asChild variant="ghost">
                    <Link href="/dashboard/patient/appointments">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                            <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={appt.avatar} alt={appt.doctor} />
                                <AvatarFallback>{appt.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{appt.doctor}</p>
                                <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                            </div>
                            </div>
                            <div className="text-right">
                            <p className="text-sm font-medium">{appt.date}</p>
                            <p className={`text-xs font-semibold ${appt.type === 'Online' ? 'text-accent-foreground' : 'text-blue-600'}`}>{appt.type}</p>
                            </div>
                        </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-muted-foreground py-4">No upcoming appointments found.</p>
                    )}
                </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>Need to get somewhere fast?</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                    <Button asChild variant="outline" className="justify-between bg-white">
                        <Link href="/dashboard/patient/find-doctor">
                        <span>Find a Doctor</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-between bg-white">
                        <Link href="/dashboard/patient/appointments">
                        <span>My Appointments</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader className="p-0">
                    <Image src="/images/LDoc.png" width={600} height={400} alt="A doctor consulting a patient" data-ai-hint="doctor patient" />
                </CardHeader>
                <CardContent className="p-4">
                    <CardTitle className="mb-2 text-lg">Your Health Journey</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Stay on top of your health by booking regular check-ups and following up with your specialists. Your well-being is our priority.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
