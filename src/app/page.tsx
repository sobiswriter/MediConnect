import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { CheckCircle2, User, Stethoscope, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary/20 py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 font-headline">
              Your Health, Reimagined.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with trusted medical professionals, manage your appointments, and take control of your healthcare journey, all in one place.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/dashboard/patient/find-doctor">Find a Doctor</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white">
                <Link href="/signup/doctor">I'm a Doctor</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">
              Healthcare in Three Simple Steps
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-accent/20 rounded-full p-4 mb-4">
                  <User className="h-10 w-10 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-headline">1. Create Your Account</h3>
                <p className="text-gray-600">
                  Sign up as a patient to start your journey towards better health management.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-accent/20 rounded-full p-4 mb-4">
                  <Stethoscope className="h-10 w-10 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-headline">2. Find Your Doctor</h3>
                <p className="text-gray-600">
                  Search our network of qualified specialists and find the right one for you.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-accent/20 rounded-full p-4 mb-4">
                  <Calendar className="h-10 w-10 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-headline">3. Book an Appointment</h3>
                <p className="text-gray-600">
                  Schedule your visit with ease through our intuitive online booking system.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">About MediConnect</h2>
                <p className="text-gray-600 mb-4">
                  MediConnect was born from a simple idea: to make healthcare more accessible, transparent, and patient-centric. We believe that technology can bridge the gap between patients and doctors, fostering better communication and improving health outcomes.
                </p>
                <p className="text-gray-600">
                  Our platform is designed with both patients and doctors in mind, providing tools that simplify scheduling, communication, and overall health management.
                </p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Verified and trusted medical professionals.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Secure and confidential platform.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Seamless appointment booking and management.</span>
                  </li>
                </ul>
              </div>
              <div>
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="A modern hospital building"
                  data-ai-hint="hospital building"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
