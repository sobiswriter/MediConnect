import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, PlusCircle, Video } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboardPage() {
  const upcomingAppointments = [
    {
      doctor: 'Dr. Evelyn Reed',
      specialty: 'Cardiologist',
      date: 'Tomorrow, 10:30 AM',
      type: 'Online',
      avatar: 'https://placehold.co/100x100.png',
      initials: 'ER'
    },
    {
      doctor: 'Dr. Samuel Chen',
      specialty: 'Dermatologist',
      date: 'June 28, 2024, 2:00 PM',
      type: 'In-Person',
      avatar: 'https://placehold.co/100x100.png',
      initials: 'SC'
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Welcome back, Alex!</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary/20 border-primary">
          <CardHeader>
            <CardTitle>Next Appointment</CardTitle>
            <CardDescription>You have an upcoming appointment soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={upcomingAppointments[0].avatar} alt={upcomingAppointments[0].doctor} />
                <AvatarFallback>{upcomingAppointments[0].initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{upcomingAppointments[0].doctor}</p>
                <p className="text-sm text-muted-foreground">{upcomingAppointments[0].specialty}</p>
                <p className="text-sm font-medium">{upcomingAppointments[0].date}</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Video className="mr-2 h-4 w-4" /> Join Video Call
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Book a New Appointment</CardTitle>
            <CardDescription>Find a specialist and schedule a visit.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Need to see a doctor? Our network of specialists is ready to help you.
            </p>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/dashboard/patient/find-doctor">
                <PlusCircle className="mr-2 h-4 w-4" /> Book Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div >
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Here are your scheduled appointments.</CardDescription>
          </div>
          <Button asChild variant="ghost">
            <Link href="/dashboard/patient/appointments">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appt, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={appt.avatar} alt={appt.doctor} />
                    <AvatarFallback>{appt.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{appt.doctor}</p>
                    <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{appt.date}</p>
                  <p className={`text-xs font-semibold ${appt.type === 'Online' ? 'text-accent-foreground' : 'text-blue-600'}`}>{appt.type}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
