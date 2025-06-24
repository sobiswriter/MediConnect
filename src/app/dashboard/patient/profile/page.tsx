'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientProfile {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    medicalHistory: string;
}

export default function PatientProfilePage() {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    const fetchProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const profileDocRef = doc(db, 'patientProfiles', user.uid);
            const docSnap = await getDoc(profileDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    dateOfBirth: data.dateOfBirth || '',
                    address: data.address || '',
                    medicalHistory: data.medicalHistory || '',
                });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch profile.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile) return;
        setLoading(true);
        try {
            const profileDocRef = doc(db, 'patientProfiles', user.uid);
            await updateDoc(profileDocRef, {
                name: profile.name,
                phone: profile.phone,
                dateOfBirth: profile.dateOfBirth,
                address: profile.address,
                medicalHistory: profile.medicalHistory,
                updatedAt: serverTimestamp()
            });

            if (userProfile && userProfile.displayName !== profile.name) {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, { displayName: profile.name });
            }

            toast({ title: 'Success', description: 'Profile updated successfully.' });
        } catch (error: any) {
            toast({ title: 'Error', description: `Failed to update profile: ${error.message}`, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    
    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

    if (loading) {
         return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-2/5 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-8">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        </div>
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-24 w-full" /></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Update your personal and medical information.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSaveChanges} className="space-y-8">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="https://placehold.co/128x128.png" alt={profile?.name || ''} />
                            <AvatarFallback>{getInitials(profile?.name || '')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-semibold">{profile?.name}</h3>
                            <p className="text-muted-foreground">{profile?.email}</p>
                            <Button variant="outline" size="sm" className="mt-2 bg-white">Change Photo</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={profile?.name || ''} onChange={e => setProfile(p => p ? { ...p, name: e.target.value } : null)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={profile?.email || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="+1 (123) 456-7890" value={profile?.phone || ''} onChange={e => setProfile(p => p ? { ...p, phone: e.target.value } : null)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" type="date" value={profile?.dateOfBirth || ''} onChange={e => setProfile(p => p ? { ...p, dateOfBirth: e.target.value } : null)} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" placeholder="123 Health St, Wellness City, USA" value={profile?.address || ''} onChange={e => setProfile(p => p ? { ...p, address: e.target.value } : null)} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="medical-history">Brief Medical History</Label>
                            <Textarea id="medical-history" placeholder="e.g. Allergies, chronic conditions..." rows={4} value={profile?.medicalHistory || ''} onChange={e => setProfile(p => p ? { ...p, medicalHistory: e.target.value } : null)} />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
