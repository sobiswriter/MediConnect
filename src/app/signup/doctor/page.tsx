import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DoctorSignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center items-center gap-2 font-bold text-2xl text-gray-800 mb-2">
            <HeartPulse className="h-8 w-8 text-primary-foreground bg-accent p-1 rounded-md" />
            <span className="font-headline">MediConnect</span>
          </Link>
          <CardTitle className="text-2xl font-headline">Join as a Healthcare Professional</CardTitle>
          <CardDescription>Expand your reach and connect with patients.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="Dr. Jane Smith" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="dr.smith@clinic.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select>
                    <SelectTrigger id="specialization">
                        <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="license-number">License Number</Label>
                    <Input id="license-number" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input id="experience" type="number" min="0" required />
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
            Not a doctor?{' '}
            <Link href="/signup/patient" className="text-accent-foreground hover:underline">
              Sign up as a patient
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
