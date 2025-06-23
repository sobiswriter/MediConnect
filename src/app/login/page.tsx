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
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <Link href="/" className="flex justify-center items-center gap-2 font-bold text-2xl text-gray-800 mb-2">
                        <HeartPulse className="h-8 w-8 text-primary-foreground bg-accent p-1 rounded-md" />
                        <span className="font-headline">MediConnect</span>
                    </Link>
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
                <CardFooter className="flex-col gap-4">
                    <div className="text-center text-sm">
                        Don't have an account?{' '}
                        <Link href="/signup/patient" className="text-accent-foreground hover:underline">
                            Sign up as a Patient
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
