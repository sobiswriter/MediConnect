import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function DoctorProfilePage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Doctor Profile</CardTitle>
                    <CardDescription>Manage your professional information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="https://placehold.co/128x128.png" alt="Dr. Jane Doe" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-semibold">Dr. Jane Doe</h3>
                            <p className="text-muted-foreground">dr.jane@mediconnect.com</p>
                            <Button variant="outline" size="sm" className="mt-2 bg-white">Change Photo</Button>
                        </div>
                    </div>
                    
                    <form className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue="Dr. Jane Doe" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue="dr.jane@mediconnect.com" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="specialty">Specialty</Label>
                                <Select defaultValue="dermatology">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select specialty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cardiology">Cardiology</SelectItem>
                                        <SelectItem value="dermatology">Dermatology</SelectItem>
                                        <SelectItem value="neurology">Neurology</SelectItem>
                                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="experience">Years of Experience</Label>
                                <Input id="experience" type="number" defaultValue="12" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="bio">Professional Bio</Label>
                            <Textarea id="bio" placeholder="Tell patients a little about yourself..." rows={5} defaultValue="Dr. Jane Doe is a board-certified dermatologist with over 12 years of experience in treating a wide range of skin conditions. She is passionate about helping her patients achieve healthy, beautiful skin."/>
                        </div>

                        <div className="space-y-1">
                            <Label>Qualifications & Certifications</Label>
                             <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">Board Certified in Dermatology</Badge>
                                <Badge variant="secondary">MD, Stanford University</Badge>
                                <Badge variant="secondary">Fellow of the American Academy of Dermatology</Badge>
                             </div>
                             <Input placeholder="Add a new qualification..." className="mt-2" />
                        </div>
                        
                        <div className="flex justify-end">
                            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
