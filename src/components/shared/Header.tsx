import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, HeartPulse } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-800">
          <HeartPulse className="h-7 w-7 text-primary-foreground bg-accent p-1 rounded-md" />
          <span className="font-headline">MediConnect</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/#about" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</Link>
          <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</Link>
          <Link href="/dashboard/patient/find-doctor" className="text-gray-600 hover:text-gray-900 transition-colors">Find a Doctor</Link>
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Log In</Link>
          </Button>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Sign Up</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>I am a...</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/signup/patient">Patient</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/signup/doctor">Doctor</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 p-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                  <HeartPulse className="h-6 w-6 text-accent" />
                  MediConnect
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link href="/#about">About Us</Link>
                  <Link href="/#how-it-works">How It Works</Link>
                  <Link href="/dashboard/patient/find-doctor">Find a Doctor</Link>
                </nav>
                <div className="border-t pt-4 mt-4 flex flex-col gap-2">
                  <Button asChild variant="outline">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup/patient">Sign Up as Patient</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup/doctor">Sign Up as Doctor</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
