'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Video } from "lucide-react";

export default function DoctorDashboardPage() {
    const chartData = [
        { month: 'Jan', appointments: 45 },
        { month: 'Feb', appointments: 62 },
        { month: 'Mar', appointments: 78 },
        { month: 'Apr', appointments: 70 },
        { month: 'May', appointments: 85 },
        { month: 'Jun', appointments: 92 },
    ];
    const upcomingAppointments = [
        { patient: 'Alex Smith', time: '10:30 AM', type: 'Online', avatar: 'https://placehold.co/100x100.png', initials: 'AS' },
        { patient: 'Maria Garcia', time: '11:00 AM', type: 'In-Person', avatar: 'https://placehold.co/100x100.png', initials: 'MG' },
        { patient: 'Chen Wei', time: '2:30 PM', type: 'Online', avatar: 'https://placehold.co/100x100.png', initials: 'CW' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Welcome back, Dr. Doe!</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Appointments (Month)</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">92</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">New Patients (Month)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12</div>
                        <p className="text-xs text-muted-foreground">+8.2% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">10:30 AM</div>
                        <p className="text-xs text-muted-foreground">with Alex Smith (Online)</p>
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
                        <CardDescription>You have {upcomingAppointments.length} appointments today.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingAppointments.map((appt, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={appt.avatar} alt={appt.patient} />
                                            <AvatarFallback>{appt.initials}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{appt.patient}</p>
                                            <p className="text-sm text-muted-foreground">{appt.time}</p>
                                        </div>
                                    </div>
                                    <Badge variant={appt.type === 'Online' ? 'default' : 'secondary'} className={appt.type === 'Online' ? 'bg-accent text-accent-foreground' : ''}>{appt.type}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
