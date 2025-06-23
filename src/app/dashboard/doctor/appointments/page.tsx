'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DoctorAppointmentsPage() {
    const today = new Date(2024, 6, 12);
    const appointmentsByDate: { [key: string]: any[] } = {
        [new Date(2024, 6, 12).toISOString().split('T')[0]]: [
            { patient: 'Alex Smith', time: '10:30 AM', type: 'Online', avatar: 'https://placehold.co/100x100.png', initials: 'AS' },
            { patient: 'Maria Garcia', time: '11:00 AM', type: 'In-Person', avatar: 'https://placehold.co/100x100.png', initials: 'MG' },
            { patient: 'Chen Wei', time: '2:30 PM', type: 'Online', avatar: 'https://placehold.co/100x100.png', initials: 'CW' },
        ],
        [new Date(2024, 6, 15).toISOString().split('T')[0]]: [
             { patient: 'John Wick', time: '09:00 AM', type: 'In-Person', avatar: 'https://placehold.co/100x100.png', initials: 'JW' },
        ],
    };

    const [date, setDate] = React.useState<Date | undefined>(today);
    const selectedDateString = date ? date.toISOString().split('T')[0] : '';
    const selectedAppointments = appointmentsByDate[selectedDateString] || [];
    const appointmentDates = Object.keys(appointmentsByDate).map(d => new Date(d));

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Appointments Calendar</CardTitle>
                        <CardDescription>Select a date to see your schedule.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            modifiers={{ appointments: appointmentDates }}
                            modifiersClassNames={{ appointments: 'bg-primary/20' }}
                            defaultMonth={new Date(2024, 6, 1)}
                            className="p-0"
                            classNames={{
                                day_selected: "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent/90",
                                day_today: "bg-primary text-primary-foreground"
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>
                            Schedule for {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Today'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedAppointments.length > 0 ? selectedAppointments.map((appt, index) => (
                             <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No appointments scheduled for this day.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
