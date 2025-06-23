'use client';
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { add, format } from "date-fns";

export default function DoctorAvailabilityPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [dates, setDates] = useState<Date[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
    ];

    const handleSlotToggle = (slot: string) => {
        const newSelectedSlots = new Set(selectedSlots);
        if (newSelectedSlots.has(slot)) {
            newSelectedSlots.delete(slot);
        } else {
            newSelectedSlots.add(slot);
        }
        setSelectedSlots(newSelectedSlots);
    };

    const handleSaveAvailability = async () => {
        if (!user || dates.length === 0 || selectedSlots.size === 0) {
            toast({ title: 'Error', description: 'Please select at least one date and one time slot.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        const availabilityBatch: Promise<any>[] = [];
        const availabilityCollection = collection(db, 'doctorAvailability');
        const durationMinutes = 30; // Assuming 30-minute slots

        dates.forEach(date => {
            selectedSlots.forEach(slot => {
                const [hours, minutes] = slot.split(':').map(Number);
                const startTime = new Date(date);
                startTime.setHours(hours, minutes, 0, 0);

                const endTime = add(startTime, { minutes: durationMinutes });

                const newSlot = {
                    doctorId: user.uid,
                    date: Timestamp.fromDate(date),
                    startTime: format(startTime, "HH:mm"),
                    endTime: format(endTime, "HH:mm"),
                    isBooked: false,
                    bookedByPatientId: null,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };
                availabilityBatch.push(addDoc(availabilityCollection, newSlot));
            });
        });

        try {
            await Promise.all(availabilityBatch);
            toast({ title: 'Success', description: 'Your availability has been updated.' });
            setDates([]);
            setSelectedSlots(new Set());
        } catch (error) {
            console.error("Error saving availability: ", error);
            toast({ title: 'Error', description: 'Failed to save availability.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    
    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':');
        const h = parseInt(hour);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const formattedHour = ((h + 11) % 12 + 1);
        return `${formattedHour}:${minute} ${suffix}`;
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Set Your Availability</CardTitle>
                <CardDescription>Select one or more dates on the calendar, then choose your available time slots for those dates.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8 items-start">
                <div className="flex justify-center">
                    <Calendar
                        mode="multiple"
                        selected={dates}
                        onSelect={(d) => setDates(d || [])}
                        disabled={{ before: new Date() }}
                        className="rounded-md border"
                            classNames={{
                            day_selected: "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent/90",
                            day_today: "bg-primary/20 text-primary-foreground"
                        }}
                    />
                </div>
                <div className="pt-2">
                    <h3 className="text-lg font-semibold mb-4">
                        {dates.length > 0 
                            ? `Available Time Slots for ${dates.length} selected date(s)`
                            : 'Select a date to manage time slots'
                        }
                    </h3>
                    
                    {dates.length > 0 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {timeSlots.map(slot => (
                                    <div key={slot} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`slot-${slot}`} 
                                            checked={selectedSlots.has(slot)}
                                            onCheckedChange={() => handleSlotToggle(slot)}
                                        />
                                        <Label htmlFor={`slot-${slot}`}>{formatTime(slot)}</Label>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleSaveAvailability} disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                {loading ? 'Saving...' : 'Save Availability'}
                            </Button>
                        </div>
                    ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">Please select one or more dates from the calendar to set your available times.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
