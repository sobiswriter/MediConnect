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
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">My Profile</CardTitle>
                        <CardDescription>Update your personal and medical information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveChanges} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="https://placehold.co/128x128.png" alt={profile?.name || ''} data-ai-hint="person" />
                                    <AvatarFallback className="text-2xl">{getInitials(profile?.name || '')}</AvatarFallback>
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
            </div>
             <div className="lg:col-span-1 space-y-6">
                <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                         <Image src="https://placehold.co/600x400.png" width={600} height={400} alt="A doctor consulting a patient" data-ai-hint="doctor patient" />
                    </CardHeader>
                    <CardContent className="p-4">
                        <CardTitle className="mb-2 text-lg">Your Health Journey</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Keeping your profile up-to-date helps us and your doctors provide you with the best possible care. A complete profile leads to better, more personalized health services.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Links</CardTitle>
                        <CardDescription>Need to get somewhere fast?</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                       <Button asChild variant="outline" className="justify-between bg-white">
                         <Link href="/dashboard/patient/find-doctor">
                            <span>Find a New Doctor</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                       </Button>
                       <Button asChild variant="outline" className="justify-between bg-white">
                         <Link href="/dashboard/patient/appointments">
                             <span>View My Appointments</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                       </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
