import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse } from 'lucide-react';

export default function LoginPage() {
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-accent-foreground hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Log In</Button>
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
