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
        )
    }

    return (
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
    );
}
