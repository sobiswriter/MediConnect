'use client';
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function DoctorAvailabilityPage() {
    const [dates, setDates] = React.useState<Date[]>([]);

    const timeSlots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
    ];

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Set Your Availability</CardTitle>
                        <CardDescription>Select dates on the calendar to manage available time slots.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="multiple"
                            selected={dates}
                            onSelect={(d) => setDates(d || [])}
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
                        <CardTitle>Available Time Slots</CardTitle>
                        <CardDescription>
                            {dates.length > 0 
                                ? `For ${dates.length} selected date(s)`
                                : 'Select a date to see time slots'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dates.length > 0 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {timeSlots.map(slot => (
                                        <div key={slot} className="flex items-center space-x-2">
                                            <Checkbox id={`slot-${slot.replace(/\s/g, '-')}`} />
                                            <Label htmlFor={`slot-${slot.replace(/\s/g, '-')}`}>{slot}</Label>
                                        </div>
                                    ))}
                                </div>
                                 <div className="border-t pt-4">
                                    <Label>Or set recurring weekly availability</Label>
                                    <div className="flex gap-2 mt-2">
                                        <Input type="time" defaultValue="09:00" />
                                        <Input type="time" defaultValue="17:00" />
                                    </div>
                                    <Button variant="secondary" className="w-full mt-2">Apply to all selected weekdays</Button>
                                </div>
                                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Save Availability</Button>
                            </div>
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-8">Please select one or more dates from the calendar.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
