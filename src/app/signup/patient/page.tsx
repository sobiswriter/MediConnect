
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

export default function PatientSignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !dob || !gender) {
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
        role: 'patient',
        createdAt: serverTimestamp(),
      });

      const profileDocRef = doc(db, 'patientProfiles', user.uid);
      batch.set(profileDocRef, {
        patientId: user.uid,
        name: fullName,
        email: user.email,
        dateOfBirth: dob,
        gender: gender,
        createdAt: serverTimestamp(),
      });
      
      await batch.commit();
      
      router.push('/dashboard/patient/profile');
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
                alt="A calm and welcoming medical reception area"
                fill
                className="object-cover"
                data-ai-hint="medical reception"
            />
            <div className="relative z-10 bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
                <Link href="/" className="flex justify-center items-center gap-2 font-bold text-3xl text-gray-800 mb-4">
                    <HeartPulse className="h-10 w-10 text-primary-foreground bg-accent p-1.5 rounded-lg" />
                    <span className="font-headline">MediConnect</span>
                </Link>
                <h2 className="text-2xl font-bold font-headline text-gray-700">
                    Begin Your Health Journey
                </h2>
                <p className="text-gray-600 mt-2 max-w-sm">
                    Create your secure patient account to connect with doctors and manage your health with ease.
                </p>
            </div>
        </div>
        <div className="flex items-center justify-center p-6 sm:p-12 min-h-screen bg-background">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">Create a Patient Account</CardTitle>
              <CardDescription>Start your journey to better health today.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" placeholder="John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" required value={dob} onChange={(e) => setDob(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select required value={gender} onValueChange={setGender}>
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
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
                Are you a doctor?{' '}
                <Link href="/signup/doctor" className="text-accent-foreground hover:underline">
                  Sign up here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
