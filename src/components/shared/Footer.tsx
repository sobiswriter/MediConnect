import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-800 mb-2">
              <HeartPulse className="h-7 w-7 text-primary-foreground bg-accent p-1 rounded-md" />
              <span className="font-headline">MediConnect</span>
            </Link>
            <p className="text-sm text-gray-500">Your Health, Reimagined.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 font-headline">For Patients</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><Link href="/dashboard/patient/find-doctor" className="hover:underline">Find a Doctor</Link></li>
              <li><Link href="/login" className="hover:underline">Login</Link></li>
              <li><Link href="/signup/patient" className="hover:underline">Register</Link></li>
              <li><Link href="/dashboard/patient/appointments" className="hover:underline">My Appointments</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 font-headline">For Doctors</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><Link href="/signup/doctor" className="hover:underline">Join as a Doctor</Link></li>
              <li><Link href="/login" className="hover:underline">Login</Link></li>
              <li><Link href="/dashboard/doctor/appointments" className="hover:underline">Appointments</Link></li>
              <li><Link href="/dashboard/doctor/availability" className="hover:underline">Set Availability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 font-headline">Company</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><Link href="/#about" className="hover:underline">About Us</Link></li>
              <li><Link href="#" className="hover:underline">Contact</Link></li>
              <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:underline">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} MediConnect. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
