
'use client';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, orderBy, doc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { add, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AvailabilitySlot {
    id: string;
    date: Timestamp;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

export default function DoctorAvailabilityPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [dates, setDates] = useState<Date[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(true);
    const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
    ];
    
    const fetchAvailability = useCallback(async () => {
        if (!user) return;
        setAvailabilityLoading(true);
        try {
            const q = query(
                collection(db, 'doctorAvailability'),
                where('doctorId', '==', user.uid),
                orderBy('date', 'asc'),
                orderBy('startTime', 'asc')
            );
            const querySnapshot = await getDocs(q);
            const fetchedAvailability = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AvailabilitySlot));
            setAvailability(fetchedAvailability);
        } catch (error) {
            console.error("Error fetching availability:", error);
            toast({ title: 'Error', description: 'Failed to fetch your availability.', variant: 'destructive' });
        } finally {
            setAvailabilityLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    const groupedAvailability = useMemo(() => {
        return availability.reduce((acc, slot) => {
            const dateStr = format(slot.date.toDate(), 'yyyy-MM-dd');
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(slot);
            return acc;
        }, {} as Record<string, AvailabilitySlot[]>);
    }, [availability]);


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
        const durationMinutes = 30;

        dates.forEach(date => {
            selectedSlots.forEach(slot => {
                const [hours, minutes] = slot.split(':').map(Number);
                const baseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const startTime = new Date(baseDate);
                startTime.setHours(hours, minutes, 0, 0);

                const endTime = add(startTime, { minutes: durationMinutes });

                const newSlot = {
                    doctorId: user.uid,
                    date: Timestamp.fromDate(startTime),
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
            await fetchAvailability(); // Refresh list
            setDates([]);
            setSelectedSlots(new Set());
        } catch (error) {
            console.error("Error saving availability: ", error);
            toast({ title: 'Error', description: 'Failed to save availability.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteSlot = async (slotId: string) => {
        setDeletingSlotId(slotId);
        try {
            const slotDocRef = doc(db, 'doctorAvailability', slotId);
            await deleteDoc(slotDocRef);
            toast({ title: 'Success', description: 'Availability slot removed.' });
            await fetchAvailability();
        } catch (error) {
            console.error("Error deleting slot:", error);
            toast({ title: 'Error', description: 'Failed to remove slot.', variant: 'destructive' });
        } finally {
            setDeletingSlotId(null);
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
        <div className="space-y-6">
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
                            disabled={{ before: new Date(new Date().setDate(new Date().getDate() - 1)) }}
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
                                ? `Select time slots for ${dates.length} date(s)`
                                : 'Select dates to add slots'
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

            <Card>
                <CardHeader>
                    <CardTitle>Your Current Availability</CardTitle>
                    <CardDescription>A list of all your scheduled time slots.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {availabilityLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/3" />
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    ) : Object.keys(groupedAvailability).length > 0 ? (
                        Object.entries(groupedAvailability).map(([date, slots]) => (
                            <div key={date}>
                                <h3 className="text-md font-semibold mb-2 border-b pb-1">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h3>
                                <div className="space-y-2">
                                    {slots.map(slot => (
                                        <div key={slot.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                            <div className="font-mono text-sm">
                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={slot.isBooked ? "secondary" : "outline"}>{slot.isBooked ? "Booked" : "Available"}</Badge>
                                                {!slot.isBooked && (
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={deletingSlotId === slot.id}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete this availability slot. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteSlot(slot.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    {deletingSlotId === slot.id ? "Deleting..." : "Delete"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                         <p className="text-sm text-muted-foreground text-center py-8">You have not set any availability yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
