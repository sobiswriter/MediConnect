
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users } from 'lucide-react';


interface Patient {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials: string;
    firstSeen: Date;
}

export default function DoctorPatientsPage() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchPatients = async () => {
            setLoading(true);
            try {
                const appointmentsQuery = query(
                    collection(db, 'appointments'),
                    where('doctorId', '==', user.uid)
                );
                const appointmentsSnapshot = await getDocs(appointmentsQuery);

                const patientMap = new Map<string, Patient>();
                const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

                appointmentsSnapshot.docs.forEach(appointmentDoc => {
                    const data = appointmentDoc.data();
                    const patientId = data.patientId;
                    if (!patientId) return;

                    const appointmentDate = data.appointmentDateTime.toDate();
                    const existingPatient = patientMap.get(patientId);

                    if (!existingPatient || appointmentDate < existingPatient.firstSeen) {
                        patientMap.set(patientId, {
                            id: patientId,
                            name: data.patientName || 'Unknown Patient',
                            email: data.patientEmail || 'No email provided',
                            initials: getInitials(data.patientName || ''),
                            firstSeen: appointmentDate,
                        });
                    }
                });

                const resolvedPatients = Array.from(patientMap.values());
                setPatients(resolvedPatients.sort((a, b) => a.name.localeCompare(b.name)));

            } catch (error) {
                console.error("Error fetching patients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, [user]);

    if (loading) {
        return (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                     <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Patients</CardTitle>
                        <CardDescription>A list of all patients you have had appointments with.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {patients.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                        <TableHead className="hidden sm:table-cell">First Appointment</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.map(patient => (
                                        <TableRow key={patient.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={patient.avatar} alt={patient.name} />
                                                        <AvatarFallback>{patient.initials}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{patient.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{patient.email}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{patient.firstSeen.toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`#`}>View Record</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">You have not seen any patients yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
             <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patients.length}</div>
                        <p className="text-xs text-muted-foreground">Unique patients you've consulted.</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                         <Image src="/images/Hospital.png" width={600} height={400} alt="Doctor reviewing patient files" data-ai-hint="doctor files" />
                    </CardHeader>
                    <CardContent className="p-4">
                        <CardTitle className="mb-2 text-lg">Patient Management</CardTitle>
                        <p className="text-sm text-muted-foreground mb-4">
                           Access patient records and history to provide the best possible care.
                        </p>
                         <Button asChild variant="outline" className="w-full justify-between bg-white">
                            <Link href="/dashboard/doctor/appointments">
                                <span>View All Appointments</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                       </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
