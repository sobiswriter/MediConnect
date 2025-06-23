'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, Award, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DoctorProfile {
    id: string;
    name: string;
    email: string;
    specialty: string;
    yearsOfExperience: number;
    bio: string;
    qualifications: string[];
    consultationFee: number;
}

export default function ViewDoctorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const doctorId = params.doctorId as string;
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!doctorId) return;
            setLoading(true);
            try {
                const profileDocRef = doc(db, 'doctorProfiles', doctorId);
                const docSnap = await getDoc(profileDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfile({
                        id: docSnap.id,
                        name: data.name || '',
                        email: data.email || '',
                        specialty: data.specialty || '',
                        yearsOfExperience: data.yearsOfExperience || 0,
                        bio: data.bio || '',
                        qualifications: data.qualifications || [],
                        consultationFee: data.consultationFee || 0,
                    });
                } else {
                    router.push('/dashboard/patient/find-doctor');
                }
            } catch (error) {
                console.error("Error fetching doctor profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [doctorId, router]);

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/4" /><Skeleton className="h-4 w-2/5 mt-2" /></CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>
                    </div>
                    <div className="space-y-4 pt-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!profile) {
        return <p>Doctor not found.</p>;
    }

    return (
        <div className="max-w-4xl mx-auto">
        <Card>
            <CardHeader className="bg-muted/50">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary">
                        <AvatarImage src={`https://placehold.co/128x128.png`} alt={profile.name} />
                        <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                    <div className="pt-2">
                        <CardTitle className="text-3xl font-bold font-headline">{profile.name}</CardTitle>
                        <CardDescription className="text-lg text-accent-foreground font-semibold">{profile.specialty}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4" />
                                <span>{profile.yearsOfExperience} years of experience</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4" />
                                <span>${profile.consultationFee} consultation fee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Professional Bio</h3>
                    <p className="text-muted-foreground">{profile.bio || "No biography provided."}</p>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-2">Qualifications & Certifications</h3>
                    {profile.qualifications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.qualifications.map((q, i) => (
                                <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                                    <Award className="h-4 w-4 mr-1.5" />
                                    {q}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No qualifications listed.</p>
                    )}
                </div>

                <div className="pt-4 border-t">
                    <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href={`/dashboard/patient/book-appointment/${profile.id}`}>
                            Book Appointment
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
        </div>
    );
}
