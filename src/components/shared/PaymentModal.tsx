
'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmBooking: () => Promise<void>;
    amount: number;
}

export function PaymentModal({ isOpen, onClose, onConfirmBooking, amount }: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    // Dummy card details state
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const handlePayment = async () => {
        // Basic validation for the simulated form
        if (!cardNumber.trim() || !expiry.trim() || !cvc.trim()) {
            toast({
                title: "Incomplete Form",
                description: "Please fill in all card details.",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // On successful "payment", call the actual booking function
        try {
            await onConfirmBooking();
            // The booking function already shows a success toast and redirects.
            // No need to show another toast here.
        } catch (error: any) {
            toast({
                title: "Booking Failed",
                description: error.message || "An error occurred after payment. Please contact support.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
            onClose(); // Close modal regardless of booking outcome
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && !isProcessing) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Your Payment</DialogTitle>
                    <DialogDescription>
                        Please enter your payment details to confirm your appointment.
                        You will be charged ${amount.toFixed(2)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="•••• •••• •••• ••••" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} disabled={isProcessing} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiry-date">Expiry Date</Label>
                            <Input id="expiry-date" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} disabled={isProcessing}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} disabled={isProcessing}/>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handlePayment} disabled={isProcessing} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Pay $${amount.toFixed(2)}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
