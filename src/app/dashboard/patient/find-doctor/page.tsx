import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Star, MapPin } from "lucide-react"

export default function FindDoctorPage() {
    const doctors = [
        { name: 'Dr. Evelyn Reed', specialty: 'Cardiologist', rating: 4.9, reviews: 128, location: 'New York, NY', image: 'https://placehold.co/128x128.png', dataAiHint: 'doctor portrait' },
        { name: 'Dr. Samuel Chen', specialty: 'Dermatologist', rating: 4.8, reviews: 92, location: 'San Francisco, CA', image: 'https://placehold.co/128x128.png', dataAiHint: 'doctor portrait' },
        { name: 'Dr. Isabella Rossi', specialty: 'Neurologist', rating: 4.9, reviews: 150, location: 'Chicago, IL', image: 'https://placehold.co/128x128.png', dataAiHint: 'doctor portrait' },
        { name: 'Dr. Marcus Holloway', specialty: 'Orthopedic Surgeon', rating: 4.7, reviews: 76, location: 'Miami, FL', image: 'https://placehold.co/128x128.png', dataAiHint: 'doctor portrait' },
        { name: 'Dr. Chloe Bennet', specialty: 'Pediatrician', rating: 5.0, reviews: 210, location: 'Los Angeles, CA', image: 'https://placehold.co/128x128.png', dataAiHint: 'doctor portrait' },
    ];
  return (
    <div className="space-y-6">
        <div className="p-4 bg-card rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input placeholder="Search by name..." />
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by specialty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    </SelectContent>
                </Select>
                 <Input placeholder="Filter by location (e.g., city)" />
                 <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Search Doctors</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
                <Card key={index} className="flex flex-col">
                    <CardHeader className="flex-row gap-4 items-start">
                        <Image src={doctor.image} alt={`Portrait of ${doctor.name}`} data-ai-hint={doctor.dataAiHint} width={80} height={80} className="rounded-full border-2 border-primary" />
                        <div>
                            <CardTitle className="text-lg">{doctor.name}</CardTitle>
                            <p className="text-sm text-accent-foreground font-medium">{doctor.specialty}</p>
                            <div className="flex items-center gap-1 text-sm mt-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{doctor.rating}</span>
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
                         <Button variant="outline" className="w-full bg-white">View Profile</Button>
                         <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Book Now</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  )
}
