import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PatientSignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center items-center gap-2 font-bold text-2xl text-gray-800 mb-2">
            <HeartPulse className="h-8 w-8 text-primary-foreground bg-accent p-1 rounded-md" />
            <span className="font-headline">MediConnect</span>
          </Link>
          <CardTitle className="text-2xl font-headline">Create a Patient Account</CardTitle>
          <CardDescription>Start your journey to better health today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                     <Select>
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
            <Button type="submit" className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">Create Account</Button>
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
  );
}
