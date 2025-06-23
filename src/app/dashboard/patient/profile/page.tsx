import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PatientProfilePage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your personal and medical information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="https://placehold.co/128x128.png" alt="Alex Smith" />
                            <AvatarFallback>AS</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-semibold">Alex Smith</h3>
                            <p className="text-muted-foreground">alex.s@email.com</p>
                            <Button variant="outline" size="sm" className="mt-2 bg-white">Change Photo</Button>
                        </div>
                    </div>
                    
                    <form className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue="Alex Smith" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue="alex.s@email.com" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" defaultValue="+1 (123) 456-7890" />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" type="date" defaultValue="1990-05-15" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" defaultValue="123 Health St, Wellness City, USA" />
                        </div>
                        
                        <div className="space-y-1">
                            <Label htmlFor="medical-history">Brief Medical History</Label>
                            <Textarea id="medical-history" placeholder="e.g. Allergies, chronic conditions..." rows={4} />
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
