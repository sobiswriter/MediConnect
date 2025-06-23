'use client'

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

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
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !userProfile) {
    return (
        <div className="flex min-h-screen bg-background">
            <div className="hidden md:flex flex-col w-64 border-r p-4 space-y-4 bg-card">
                <Skeleton className="h-10 w-40" />
                <div className="mt-8 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
            </div>
            <div className="flex-1 p-6">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="mt-6 h-64 w-full" />
            </div>
        </div>
    );
  }

  const isDoctor = userProfile.role === 'doctor';
  const navItems = isDoctor ? doctorNavItems : patientNavItems;

  const handleLogout = async () => {
    await auth.signOut();
  };

  const getInitials = (name: string) => {
      if (!name) return '';
      const names = name.split(' ');
      if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  }

  const userInfo = {
    name: userProfile.displayName,
    email: userProfile.email,
    avatar: 'https://placehold.co/100x100.png',
    initials: getInitials(userProfile.displayName),
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
                    <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                    <AvatarFallback>{userInfo.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="font-medium text-sm truncate">{userInfo.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{userInfo.email}</span>
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
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
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
