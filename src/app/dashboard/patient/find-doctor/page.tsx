'use client';
import React, { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { Star, MapPin, Search, DollarSign } from "lucide-react"
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface DoctorProfile {
    id: string;
    name: string;
    specialty: string;
    rating: number; 
    reviews: number; 
    location: string;
    image: string;
    dataAiHint: string;
    consultationFee: number;
}

export default function FindDoctorPage() {
    const [allDoctors, setAllDoctors] = useState<DoctorProfile[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<DoctorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for input controls, synchronized with URL search params
    const [nameQuery, setNameQuery] = useState(searchParams.get('name') || '');
    const [specialtyFilter, setSpecialtyFilter] = useState(searchParams.get('specialty') || 'all');
    const [locationQuery, setLocationQuery] = useState(''); // This is disabled, keep as is.

    const specialties = useMemo(() => {
        const uniqueSpecialties = new Set(allDoctors.map(doc => doc.specialty).filter(Boolean));
        return Array.from(uniqueSpecialties).sort();
    }, [allDoctors]);
    
    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "doctorProfiles"), orderBy("name"));
                const querySnapshot = await getDocs(q);
                const doctorsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        specialty: data.specialty,
                        consultationFee: data.consultationFee || 0,
                        rating: 4.5 + Math.random() * 0.5, // Mock
                        reviews: Math.floor(Math.random() * 200), // Mock
                        location: "Virtual", // Mock
                        image: `https://placehold.co/128x128.png`,
                        dataAiHint: 'doctor portrait'
                    }
                }) as DoctorProfile[];
                setAllDoctors(doctorsData);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // Filter doctors based on searchParams whenever they change or when doctors are loaded
    useEffect(() => {
        if (loading) return;
        
        let doctors = allDoctors;
        const currentName = searchParams.get('name');
        const currentSpecialty = searchParams.get('specialty');

        if (currentName) {
            doctors = doctors.filter(doc => doc.name.toLowerCase().includes(currentName.toLowerCase()));
        }
        if (currentSpecialty && currentSpecialty !== 'all') {
            doctors = doctors.filter(doc => doc.specialty === currentSpecialty);
        }
        
        setFilteredDoctors(doctors);
        
        // Sync input fields with URL params on initial load or back/forward navigation
        setNameQuery(currentName || '');
        setSpecialtyFilter(currentSpecialty || 'all');

    }, [allDoctors, searchParams, loading]);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (nameQuery) {
            params.set('name', nameQuery);
        } else {
            params.delete('name');
        }
        if (specialtyFilter && specialtyFilter !== 'all') {
            params.set('specialty', specialtyFilter);
        } else {
            params.delete('specialty');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setNameQuery('');
        setSpecialtyFilter('all');
        setLocationQuery('');
        router.push(pathname);
    };

  return (
    <div className="space-y-8">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Find Your Specialist</h1>
            <p className="text-muted-foreground">Search our network of verified doctors and book an appointment today.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Search Filters</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" onClick={handleClearFilters}>Clear Filters</Button>
                <Button onClick={handleSearch} className="bg-accent hover:bg-accent/90 text-accent-foreground"><Search className="mr-2 h-4 w-4" />Search Doctors</Button>
            </CardFooter>
        </Card>

        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex-row gap-4 items-start">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                        </CardContent>
                        <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
                            <CardContent className="flex-grow space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{doctor.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <DollarSign className="w-4 h-4" />
                                    <span>${doctor.consultationFee} Consultation Fee</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-2">
                                <Button asChild variant="outline" className="w-full bg-white"><Link href={`/dashboard/patient/doctor-profile/${doctor.id}`}>View Profile</Link></Button>
                                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"><Link href={`/dashboard/patient/book-appointment/${doctor.id}`}>Book Now</Link></Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                {!loading && filteredDoctors.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground col-span-full">
                        <h3 className="text-xl font-semibold">No Doctors Found</h3>
                        <p className="mt-2">Try adjusting your search filters to find a specialist.</p>
                    </div>
                )}
            </>
        )}
    </div>
  )
}
