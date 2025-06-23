'use client'

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  User,
  Settings,
  LogOut,
  HeartPulse,
  CalendarPlus,
  Users
} from 'lucide-react';

const patientNavItems = [
  { href: '/dashboard/patient', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/patient/find-doctor', label: 'Find a Doctor', icon: Stethoscope },
  { href: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/patient/profile', label: 'My Profile', icon: User },
];

const doctorNavItems = [
  { href: '/dashboard/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/doctor/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/doctor/availability', label: 'My Availability', icon: CalendarPlus },
  { href: '/dashboard/doctor/patients', label: 'My Patients', icon: Users },
  { href: '/dashboard/doctor/profile', label: 'My Profile', icon: User },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDoctor = pathname.startsWith('/dashboard/doctor');
  const navItems = isDoctor ? doctorNavItems : patientNavItems;

  const user = {
    name: isDoctor ? 'Dr. Jane Doe' : 'Alex Smith',
    email: isDoctor ? 'dr.jane@mediconnect.com' : 'alex.s@email.com',
    avatar: 'https://placehold.co/100x100.png',
    initials: isDoctor ? 'JD' : 'AS',
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <HeartPulse className="h-7 w-7 text-primary-foreground bg-accent p-1 rounded-md" />
              <span className="font-headline">MediConnect</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start gap-2 w-full px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="font-medium text-sm truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={isDoctor ? '/dashboard/doctor/profile' : '/dashboard/patient/profile'}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b h-16 bg-card">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-xl font-semibold font-headline">
                {navItems.find(item => pathname.startsWith(item.href))?.label || (isDoctor ? 'Doctor Dashboard' : 'Patient Dashboard')}
              </h1>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
