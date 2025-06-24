
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ title: 'Error', description: 'Please enter email and password.', variant: 'destructive' });
            return;
        }
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.role === 'doctor') {
                    router.push('/dashboard/doctor');
                } else {
                    router.push('/dashboard/patient');
                }
            } else {
                toast({ title: 'Error', description: 'User data not found.', variant: 'destructive' });
                await auth.signOut();
            }

        } catch (error: any) {
            toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col items-center justify-center bg-primary/20 p-12 text-center relative">
                 <Image
                    src="https://placehold.co/1200x1800.png"
                    alt="A modern medical facility"
                    fill
                    className="object-cover"
                    data-ai-hint="medical facility"
                />
                <div className="relative z-10 bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
                    <Link href="/" className="flex justify-center items-center gap-2 font-bold text-3xl text-gray-800 mb-4">
                        <HeartPulse className="h-10 w-10 text-primary-foreground bg-accent p-1.5 rounded-lg" />
                        <span className="font-headline">MediConnect</span>
                    </Link>
                    <h2 className="text-2xl font-bold font-headline text-gray-700">
                        Access Your Health Hub
                    </h2>
                    <p className="text-gray-600 mt-2 max-w-sm">
                        Log in to manage appointments, connect with professionals, and take control of your healthcare journey.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center p-6 sm:p-12 min-h-screen bg-background">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
                        <CardDescription>Enter your credentials to access your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="#" className="text-sm text-accent-foreground hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
                                {loading ? 'Logging in...' : 'Log In'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col items-center gap-4">
                         <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?
                        </div>
                        <div className="flex gap-4 text-sm">
                            <Link href="/signup/patient" className="font-semibold text-accent-foreground hover:underline">
                                Sign up as Patient
                            </Link>
                            <span className="text-muted-foreground">|</span>
                            <Link href="/signup/doctor" className="font-semibold text-accent-foreground hover:underline">
                                Sign up as Doctor
                            </Link>
                        </div>
                        <div className="mt-4 text-sm">
                            <Link href="/" className="text-muted-foreground hover:text-accent-foreground hover:underline">
                                &larr; Back to Home
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
