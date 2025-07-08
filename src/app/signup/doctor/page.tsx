
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import Image from 'next/image';

export default function DoctorSignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [experience, setExperience] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !email || !password || !specialization || !licenseNumber || !experience) {
            toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
            return;
        }
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: fullName });

            const batch = writeBatch(db);

            const userDocRef = doc(db, 'users', user.uid);
            batch.set(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: fullName,
                role: 'doctor',
                createdAt: serverTimestamp(),
            });

            const profileDocRef = doc(db, 'doctorProfiles', user.uid);
            batch.set(profileDocRef, {
                doctorId: user.uid,
                name: fullName,
                email: user.email,
                specialty: specialization,
                licenseNumber: licenseNumber,
                yearsOfExperience: parseInt(experience, 10),
                bio: '',
                qualifications: [],
                consultationFee: 50, // Default fee
                createdAt: serverTimestamp(),
            });

            await batch.commit();

            router.push('/dashboard/doctor/profile');
        } catch (error: any) {
            toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col items-center justify-center bg-primary/20 p-12 text-center relative">
                 <Image
                    src="/images/Hospital.png"
                    alt="A professional doctor looking welcoming"
                    fill
                    className="object-cover"
                    data-ai-hint="professional doctor"
                />
                <div className="relative z-10 bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
                    <Link href="/" className="flex justify-center items-center gap-2 font-bold text-3xl text-gray-800 mb-4">
                        <HeartPulse className="h-10 w-10 text-primary-foreground bg-accent p-1.5 rounded-lg" />
                        <span className="font-headline">MediConnect</span>
                    </Link>
                    <h2 className="text-2xl font-bold font-headline text-gray-700">
                      Join Our Network of Professionals
                    </h2>
                    <p className="text-gray-600 mt-2 max-w-sm">
                        Create your professional profile to connect with patients and manage your practice online.
                    </p>
                </div>
            </div>
             <div className="flex items-center justify-center p-6 sm:p-12 min-h-screen bg-background">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-headline">Join as a Healthcare Professional</CardTitle>
                        <CardDescription>Expand your reach and connect with patients.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignUp} className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full-name">Full Name</Label>
                                <Input id="full-name" placeholder="Dr. Jane Smith" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="dr.smith@clinic.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Select required value={specialization} onValueChange={setSpecialization}>
                                    <SelectTrigger id="specialization">
                                        <SelectValue placeholder="Select specialization" />
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="license-number">License Number</Label>
                                    <Input id="license-number" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Years of Experience</Label>
                                    <Input id="experience" type="number" min="0" required value={experience} onChange={(e) => setExperience(e.target.value)} />
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-accent-foreground hover:underline">
                                Log In
                            </Link>
                        </div>
                        <div className="mt-2 text-center text-sm">
                            Not a doctor?{' '}
                            <Link href="/signup/patient" className="text-accent-foreground hover:underline">
                                Sign up as a patient
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
