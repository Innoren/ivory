'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ElegantCalendar } from '@/components/elegant-calendar';
import { Loader2, Copy, Check, Link2, Mail, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateManualBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: any[];
  availability: any[];
  timeOff: any[];
  onSuccess?: () => void;
}

export function CreateManualBookingDialog({
  open,
  onOpenChange,
  services,
  availability,
  timeOff,
  onSuccess,
}: CreateManualBookingDialogProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [techNotes, setTechNotes] = useState('');
  
  // Result state
  const [inviteLink, setInviteLink] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('form');
        setSelectedService('');
        setSelectedDate(undefined);
        setSelectedTime('');
        setClientName('');
        setClientEmail('');
        setTechNotes('');
        setInviteLink('');
        setCopied(false);
      }, 200);
    }
  }, [open]);

  // Generate available times when date changes
  useEffect(() => {
    if (selectedDate) {
      generateAvailableTimes();
    }
  }, [selectedDate, availability, timeOff]);

  const generateAvailableTimes = () => {
    if (!selectedDate) return;
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[selectedDate.getDay()];
    
    // Check if date is in time off period
    const isTimeOff = timeOff.some(period => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const checkDate = new Date(selectedDate);
      checkDate.setHours(12, 0, 0, 0);
      return checkDate >= start && checkDate <= end;
    });
    
    if (isTimeOff) {
      setAvailableTimes([]);
      return;
    }
    
    // Find availability for this day
    const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek && a.isActive);
    
    if (!dayAvailability) {
      // Fall back to default hours
      const times: string[] = [];
      for (let hour = 9; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 18 && minute > 0) break;
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          times.push(`${displayHour}:${minute.toString().padStart(2, '0')} ${period}`);
        }
      }
      setAvailableTimes(times);
      return;
    }
    
    // Generate times based on availability
    const times: string[] = [];
    const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === startHour && minute < startMin) continue;
        if (hour === endHour && minute > endMin) continue;
        if (hour > endHour) break;
        
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        times.push(`${displayHour}:${minute.toString().padStart(2, '0')} ${period}`);
      }
    }
    setAvailableTimes(times);
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    const isOff = timeOff.some(period => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);
      return checkDate >= start && checkDate <= end;
    });
    
    if (isOff) return false;
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[date.getDay()];
    
    if (availability.length === 0) return true;
    return availability.some(a => a.dayOfWeek === dayOfWeek && a.isActive);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Build appointment date/time
      const appointmentDateTime = new Date(selectedDate);
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        appointmentDateTime.setHours(hours, minutes);
      }

      const response = await fetch('/api/bookings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceId: parseInt(selectedService),
          appointmentDate: appointmentDateTime.toISOString(),
          clientName,
          clientEmail,
          techNotes: techNotes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to create appointment');
        return;
      }

      setInviteLink(data.inviteLink);
      setStep('success');
      toast.success('Appointment invite created!');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating manual booking:', error);
      toast.error('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const sendEmail = () => {
    const subject = encodeURIComponent('Your Nail Appointment Invite');
    const body = encodeURIComponent(
      `Hi ${clientName},\n\nI've created a nail appointment for you. Click the link below to view the details and confirm your booking:\n\n${inviteLink}\n\nLooking forward to seeing you!`
    );
    window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`);
  };

  const selectedServiceData = services.find(s => s.id.toString() === selectedService);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif font-light text-xl">Create Manual Appointment</DialogTitle>
              <DialogDescription>
                Create an appointment and send an invite link to your client. They'll pay when they accept.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Client Info */}
              <div className="space-y-3">
                <Label className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B]">Client Information</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      placeholder="Client name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Client email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B]">Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{service.name}</span>
                          <span className="text-[#6B6B6B]">${service.price} • {service.duration}min</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B]">Date</Label>
                <div className="flex justify-center border border-[#E8E8E8] rounded-xl p-3">
                  <ElegantCalendar
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime('');
                    }}
                    disabled={(date) => !isDateAvailable(date)}
                    className="border-0 shadow-none p-0"
                  />
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="space-y-2">
                  <Label className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B]">Time</Label>
                  {availableTimes.length === 0 ? (
                    <p className="text-[13px] text-[#6B6B6B] text-center py-4">No available times on this date</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "py-2 px-2 text-[11px] rounded-lg transition-all",
                            selectedTime === time
                              ? "bg-[#8B7355] text-white"
                              : "bg-[#F8F7F5] text-[#1A1A1A] hover:bg-[#E8E8E8]"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B]">Notes for client (optional)</Label>
                <Textarea
                  placeholder="Any special instructions or notes..."
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  className="resize-none h-20"
                />
              </div>

              {/* Price Preview */}
              {selectedServiceData && (
                <div className="bg-[#F8F7F5] rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6B6B6B]">Service</span>
                    <span className="text-[#1A1A1A]">${parseFloat(selectedServiceData.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6B6B6B]">Convenience fee (15%)</span>
                    <span className="text-[#1A1A1A]">${(parseFloat(selectedServiceData.price) * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[14px] font-medium pt-2 border-t border-[#E8E8E8]">
                    <span>Client pays</span>
                    <span>${(parseFloat(selectedServiceData.price) * 1.15).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail}
                className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create & Get Link'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif font-light text-xl flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Invite Created!
              </DialogTitle>
              <DialogDescription>
                Share this link with {clientName} so they can view and pay for their appointment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Invite Link */}
              <div className="space-y-2">
                <Label className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B]">Invite Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="h-10 text-[13px] bg-[#F8F7F5]"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="h-10 w-10 flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={copyLink}
                  className="h-12 flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={sendEmail}
                  className="h-12 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Client
                </Button>
              </div>

              {/* Appointment Summary */}
              <div className="bg-[#F8F7F5] rounded-xl p-4 space-y-3">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B]">Appointment Summary</p>
                <div className="space-y-2 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B6B6B]">Client:</span>
                    <span className="text-[#1A1A1A] font-medium">{clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#6B6B6B]" />
                    <span className="text-[#1A1A1A]">
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#6B6B6B]" />
                    <span className="text-[#1A1A1A]">{selectedTime}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#6B6B6B] text-center">
                The invite expires in 7 days. You'll be notified when {clientName} accepts and pays.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)} className="w-full bg-[#1A1A1A] hover:bg-[#8B7355]">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
