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
import { X } from "lucide-react";

interface DoctorProfile {
    name: string;
    email: string;
    specialty: string;
    yearsOfExperience: number;
    bio: string;
    qualifications: string[];
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
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Doctor Profile</CardTitle>
                    <CardDescription>Manage your professional information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                    
                    <form onSubmit={handleSaveChanges} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={profile?.name || ''} onChange={e => setProfile(p => p ? { ...p, name: e.target.value } : null)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={profile?.email || ''} disabled />
                            </div>
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
    )
}
