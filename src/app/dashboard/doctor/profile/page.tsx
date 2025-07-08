
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface DoctorProfile {
    name: string;
    email: string;
    specialty: string;
    yearsOfExperience: number;
    bio: string;
    qualifications: string[];
    consultationFee: number;
}

export default function DoctorProfilePage() {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [newQualification, setNewQualification] = useState('');
    
    const fetchProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const profileDocRef = doc(db, 'doctorProfiles', user.uid);
            const docSnap = await getDoc(profileDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    specialty: data.specialty || '',
                    yearsOfExperience: data.yearsOfExperience || 0,
                    bio: data.bio || '',
                    qualifications: data.qualifications || [],
                    consultationFee: data.consultationFee || 50,
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
            const profileDocRef = doc(db, 'doctorProfiles', user.uid);
            await updateDoc(profileDocRef, {
                ...profile,
                updatedAt: serverTimestamp()
            });
            toast({ title: 'Success', description: 'Profile updated successfully.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleAddQualification = async () => {
        if (!user || !newQualification.trim()) return;
        const profileDocRef = doc(db, 'doctorProfiles', user.uid);
        await updateDoc(profileDocRef, {
            qualifications: arrayUnion(newQualification.trim())
        });
        setProfile(prev => prev ? ({ ...prev, qualifications: [...prev.qualifications, newQualification.trim()] }) : null);
        setNewQualification('');
    }

    const handleRemoveQualification = async (qualification: string) => {
        if (!user) return;
        const profileDocRef = doc(db, 'doctorProfiles', user.uid);
        await updateDoc(profileDocRef, {
            qualifications: arrayRemove(qualification)
        });
        setProfile(prev => prev ? ({ ...prev, qualifications: prev.qualifications.filter(q => q !== qualification) }) : null);
    }
    
    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

    if (loading || !userProfile) {
        return (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/4" /><Skeleton className="h-4 w-2/5 mt-2" /></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-64" /></div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Doctor Profile</CardTitle>
                        <CardDescription>Manage your professional information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveChanges} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="https://placehold.co/128x128.png" alt={profile?.name || ''} />
                                    <AvatarFallback className="text-2xl">{getInitials(profile?.name || '')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-semibold">{profile?.name}</h3>
                                    <p className="text-muted-foreground">{profile?.email}</p>
                                    <Button variant="outline" size="sm" className="mt-2 bg-white">Change Photo</Button>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={profile?.name || ''} onChange={e => setProfile(p => p ? { ...p, name: e.target.value } : null)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={profile?.email || ''} disabled />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="specialty">Specialty</Label>
                                    <Select value={profile?.specialty || ''} onValueChange={val => setProfile(p => p ? { ...p, specialty: val } : null)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select specialty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cardiology">Cardiology</SelectItem>
                                            <SelectItem value="Dermatology">Dermatology</SelectItem>
                                            <SelectItem value="Neurology">Neurology</SelectItem>
                                            <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                                            <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="experience">Years of Experience</Label>
                                    <Input id="experience" type="number" value={profile?.yearsOfExperience || 0} onChange={e => setProfile(p => p ? { ...p, yearsOfExperience: Number(e.target.value) } : null)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="fee">Consultation Fee ($)</Label>
                                    <Input id="fee" type="number" value={profile?.consultationFee || 0} onChange={e => setProfile(p => p ? { ...p, consultationFee: Number(e.target.value) } : null)} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="bio">Professional Bio</Label>
                                <Textarea id="bio" placeholder="Tell patients a little about yourself..." rows={5} value={profile?.bio || ''} onChange={e => setProfile(p => p ? { ...p, bio: e.target.value } : null)} />
                            </div>

                            <div className="space-y-1">
                                <Label>Qualifications & Certifications</Label>
                                <div className="flex flex-wrap gap-2">
                                    {profile?.qualifications.map((q, i) => (
                                        <Badge key={i} variant="secondary" className="pr-1">
                                            {q}
                                            <button onClick={() => handleRemoveQualification(q)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3"/></button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Input placeholder="Add a new qualification..." value={newQualification} onChange={e => setNewQualification(e.target.value)} />
                                    <Button type="button" variant="outline" onClick={handleAddQualification}>Add</Button>
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
                         <Image src="/images/ODoc.png" width={600} height={400} alt="A doctor at their desk" data-ai-hint="doctor desk" />
                    </CardHeader>
                    <CardContent className="p-4">
                        <CardTitle className="mb-2 text-lg">Your Professional Hub</CardTitle>
                        <p className="text-sm text-muted-foreground">
                           A complete and up-to-date profile builds trust with patients and helps them find the care they need. Keep your information current for the best results.
                        </p>
                    </CardContent>
                </Card>
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
            </div>
        </div>
    )
}
