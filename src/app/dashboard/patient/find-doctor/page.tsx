'use client';
import React, { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Star, MapPin, Search } from "lucide-react"
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface DoctorProfile {
    id: string;
    name: string;
    specialty: string;
    rating: number; // Mock data for now
    reviews: number; // Mock data for now
    location: string; // Mock data for now
    image: string;
    dataAiHint: string;
}

export default function FindDoctorPage() {
    const [allDoctors, setAllDoctors] = useState<DoctorProfile[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<DoctorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [nameQuery, setNameQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [locationQuery, setLocationQuery] = useState('');

    const specialties = useMemo(() => {
        const uniqueSpecialties = new Set(allDoctors.map(doc => doc.specialty).filter(Boolean));
        return Array.from(uniqueSpecialties);
    }, [allDoctors]);
    
    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "doctorProfiles"), orderBy("name"));
                const querySnapshot = await getDocs(q);
                const doctorsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name,
                    specialty: doc.data().specialty,
                    rating: 4.5 + Math.random() * 0.5, // Mock
                    reviews: Math.floor(Math.random() * 200), // Mock
                    location: "Virtual", // Mock
                    image: `https://placehold.co/128x128.png`,
                    dataAiHint: 'doctor portrait'
                })) as DoctorProfile[];
                setAllDoctors(doctorsData);
                setFilteredDoctors(doctorsData);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleSearch = () => {
        let doctors = allDoctors;
        if (nameQuery) {
            doctors = doctors.filter(doc => doc.name.toLowerCase().includes(nameQuery.toLowerCase()));
        }
        if (specialtyFilter && specialtyFilter !== 'all') {
            doctors = doctors.filter(doc => doc.specialty === specialtyFilter);
        }
        if (locationQuery) {
             doctors = doctors.filter(doc => doc.location.toLowerCase().includes(locationQuery.toLowerCase()));
        }
        setFilteredDoctors(doctors);
    };

  return (
    <div className="space-y-6">
        <div className="p-4 bg-card rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input placeholder="Search by name..." value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} />
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by specialty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Specialties</SelectItem>
                        {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Input placeholder="Filter by location (e.g., city)" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} disabled/>
                 <Button onClick={handleSearch} className="bg-accent hover:bg-accent/90 text-accent-foreground"><Search className="mr-2 h-4 w-4" />Search Doctors</Button>
            </div>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-20 w-20 rounded-full" /></CardHeader><CardContent><Skeleton className="h-6 w-3/4" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                    <Card key={doctor.id} className="flex flex-col">
                        <CardHeader className="flex-row gap-4 items-start">
                            <Image src={doctor.image} alt={`Portrait of ${doctor.name}`} data-ai-hint={doctor.dataAiHint} width={80} height={80} className="rounded-full border-2 border-primary" />
                            <div>
                                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                                <p className="text-sm text-accent-foreground font-medium">{doctor.specialty}</p>
                                <div className="flex items-center gap-1 text-sm mt-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>{doctor.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground">({doctor.reviews} reviews)</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{doctor.location}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                             <Button asChild variant="outline" className="w-full bg-white"><Link href={`/dashboard/doctor/profile/${doctor.id}`}>View Profile</Link></Button>
                             <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"><Link href={`/dashboard/patient/book-appointment/${doctor.id}`}>Book Now</Link></Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
         {!loading && filteredDoctors.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
                <p>No doctors found matching your criteria.</p>
            </div>
        )}
    </div>
  )
}
