import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DoctorPatientsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Patients</CardTitle>
            </CardHeader>
            <CardContent>
                <p>A list of your patients will be displayed here.</p>
            </CardContent>
        </Card>
    );
}
