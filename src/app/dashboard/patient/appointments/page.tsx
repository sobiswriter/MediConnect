import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function PatientAppointmentsPage() {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="multiple"
                            selected={[new Date(2024, 6, 12), new Date(2024, 6, 28)]} // Example dates
                            defaultMonth={new Date(2024, 6, 1)}
                            className="p-0"
                            classNames={{
                                day_selected: "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent/90",
                                day_today: "bg-primary/20 text-primary-foreground"
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
             <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="font-semibold">Dr. Evelyn Reed</p>
                            <p className="text-sm text-muted-foreground">Cardiology</p>
                            <p className="text-sm font-medium mt-1">July 12, 2024, 10:30 AM (Online)</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="font-semibold">Dr. Samuel Chen</p>
                            <p className="text-sm text-muted-foreground">Dermatology</p>
                            <p className="text-sm font-medium mt-1">July 28, 2024, 2:00 PM (In-Person)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
