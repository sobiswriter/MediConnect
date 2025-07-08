
'use client'
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Video, ArrowRight } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { format, subMonths, startOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface Appointment {
    id: string;
    patientId: string;
    patientName?: string;
    patientInitials?: string;
    appointmentDateTime: Timestamp;
    type: string;
}

export default function DoctorDashboardPage() {
    const { user, userProfile } = useAuth();
    const [stats, setStats] = useState({ totalAppointments: 0, newPatients: 0 });
    const [chartData, setChartData] = useState<any[]>([]);
    const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch appointments for stats and list
                const now = new Date();
                const startOfCurrentMonth = startOfMonth(now);
                const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
                const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

                const appointmentsQuery = query(
                    collection(db, 'appointments'), 
                    where('doctorId', '==', user.uid)
                );
                const querySnapshot = await getDocs(appointmentsQuery);
                const allAppointments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));

                // Sort client-side to avoid composite index
                allAppointments.sort((a, b) => a.appointmentDateTime.toDate().getTime() - b.appointmentDateTime.toDate().getTime());

                const patientIds = new Set<string>();
                const appointmentsThisMonth = allAppointments.filter(appt => {
                    const apptDate = appt.appointmentDateTime.toDate();
                    if (apptDate >= startOfCurrentMonth) {
                        patientIds.add(appt.patientId);
                        return true;
                    }
                    return false;
                });
                
                const todaysAppts = allAppointments.filter(appt => {
                    const apptDate = appt.appointmentDateTime.toDate();
                    return apptDate >= todayStart && apptDate <= todayEnd;
                });
                
                const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

                const populatedTodaysAppointments = todaysAppts.map(appt => ({
                    ...appt,
                    patientName: appt.patientName || 'Unknown Patient',
                    patientInitials: getInitials(appt.patientName || ''),
                }));

                setTodaysAppointments(populatedTodaysAppointments);
                setStats({ totalAppointments: appointmentsThisMonth.length, newPatients: patientIds.size });

                // Fetch data for chart (last 6 months)
                const monthlyData: { [key: string]: number } = {};
                for (let i = 5; i >= 0; i--) {
                    const monthDate = subMonths(now, i);
                    const monthName = format(monthDate, 'MMM');
                    monthlyData[monthName] = 0;
                }

                allAppointments.forEach(appt => {
                    const apptDate = appt.appointmentDateTime.toDate();
                    if (apptDate >= subMonths(now, 6)) {
                        const monthName = format(apptDate, 'MMM');
                        if (monthlyData[monthName] !== undefined) {
                            monthlyData[monthName]++;
                        }
                    }
                });

                const chartResult = Object.keys(monthlyData).map(month => ({
                    month,
                    appointments: monthlyData[month]
                }));
                setChartData(chartResult);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);
    
    const nextAppointment = todaysAppointments[0];

    if (loading) {
        return (
            <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-9 w-1/2" />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[250px] w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Welcome back, {userProfile?.displayName || 'Doctor'}!</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Appointments (Month)</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">New Patients (Month)</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{stats.newPatients}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                            <Video className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {nextAppointment ? (
                                <>
                                    <div className="text-2xl font-bold">{nextAppointment.appointmentDateTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <p className="text-xs text-muted-foreground">with {nextAppointment.patientName} ({nextAppointment.type})</p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground pt-2">No more appointments today.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointments Overview</CardTitle>
                            <CardDescription>Your appointment trends for the last 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData}>
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                    <Bar dataKey="appointments" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Schedule</CardTitle>
                            <CardDescription>You have {todaysAppointments.length} appointments today.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {todaysAppointments.length > 0 ? todaysAppointments.map((appt) => (
                                    <div key={appt.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={'https://placehold.co/100x100.png'} alt={appt.patientName} />
                                                <AvatarFallback>{appt.patientInitials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{appt.patientName}</p>
                                                <p className="text-sm text-muted-foreground">{appt.appointmentDateTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <Badge variant={appt.type === 'Online' ? 'default' : 'secondary'} className={appt.type === 'Online' ? 'bg-accent text-accent-foreground' : ''}>{appt.type}</Badge>
                                    </div>
                                )) : (
                                    <p className="text-center text-sm text-muted-foreground py-4">No appointments scheduled for today.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Links</CardTitle>
                        <CardDescription>Manage your practice efficiently.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                       <Button asChild variant="outline" className="justify-between bg-white">
                         <Link href="/dashboard/doctor/availability">
                            <span>Set My Availability</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                       </Button>
                       <Button asChild variant="outline" className="justify-between bg-white">
                         <Link href="/dashboard/doctor/appointments">
                             <span>View Appointments</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                       </Button>
                       <Button asChild variant="outline" className="justify-between bg-white">
                         <Link href="/dashboard/doctor/patients">
                             <span>My Patient List</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                       </Button>
                    </CardContent>
                </Card>
                 <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                         <Image src="/images/Doc.png" width={600} height={400} alt="A doctor at their desk" data-ai-hint="doctor desk" />
                    </CardHeader>
                    <CardContent className="p-4">
                        <CardTitle className="mb-2 text-lg">Your Professional Hub</CardTitle>
                        <p className="text-sm text-muted-foreground">
                           A complete and up-to-date dashboard gives you a quick overview of your practice.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
