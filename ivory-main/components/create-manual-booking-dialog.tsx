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
      <DialogContent className="sm:max-w-2xl w-[calc(100%-2rem)] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto bg-[#FAFAF8] border-[#E8E8E8]">
        {step === 'form' ? (
          <>
            <DialogHeader className="space-y-2 sm:space-y-3 pb-2">
              <DialogTitle className="font-serif font-light text-xl sm:text-2xl text-[#1A1A1A] tracking-tight">
                Create Appointment
              </DialogTitle>
              <DialogDescription className="text-[12px] sm:text-[13px] text-[#6B6B6B] font-light leading-relaxed">
                Create an appointment and send an invite link to your client. They'll pay when they accept.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 sm:space-y-6 py-3 sm:py-4">
              {/* Client Info */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8B7355] font-medium">Client Information</Label>
                <div className="space-y-2 sm:space-y-3">
                  <Input
                    placeholder="Client name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="h-10 sm:h-11 bg-white border-[#E8E8E8] focus:border-[#8B7355] text-[13px] sm:text-[14px]"
                  />
                  <Input
                    type="email"
                    placeholder="Client email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="h-10 sm:h-11 bg-white border-[#E8E8E8] focus:border-[#8B7355] text-[13px] sm:text-[14px]"
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8B7355] font-medium">Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="h-11 sm:h-12 bg-white border-[#E8E8E8] focus:border-[#8B7355] text-[14px] sm:text-[15px] rounded-xl shadow-sm hover:border-[#8B7355]/50 transition-colors">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E8E8E8] max-h-[280px] sm:max-h-[360px] rounded-xl shadow-lg">
                    {services.length === 0 ? (
                      <div className="p-4 sm:p-6 text-center text-[13px] sm:text-[14px] text-[#6B6B6B] font-light">
                        No services available. Please add services first.
                      </div>
                    ) : (
                      services.map((service) => (
                        <SelectItem 
                          key={service.id} 
                          value={service.id.toString()}
                          className="text-[14px] sm:text-[15px] cursor-pointer py-3 sm:py-4 px-3 sm:px-4 hover:bg-[#F8F7F5] focus:bg-[#8B7355]/10 transition-colors my-1 mx-1 rounded-lg"
                        >
                          <div className="flex flex-col gap-1.5 w-full">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-[#1A1A1A] tracking-tight">{service.name}</span>
                              <span className="text-[15px] sm:text-[16px] font-semibold text-[#8B7355]">${service.price}</span>
                            </div>
                            {service.description && (
                              <p className="text-[11px] sm:text-[12px] text-[#6B6B6B] font-light line-clamp-1">{service.description}</p>
                            )}
                            <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-[#8B7355]">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{service.duration} minutes</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8B7355] font-medium">Date</Label>
                <div className="flex justify-center bg-white border border-[#E8E8E8] rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm">
                  <ElegantCalendar
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime('');
                    }}
                    disabled={(date) => !isDateAvailable(date)}
                    className="border-0 shadow-none p-0 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8B7355] font-medium">Time</Label>
                  {availableTimes.length === 0 ? (
                    <div className="bg-white border border-[#E8E8E8] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                      <p className="text-[12px] sm:text-[13px] text-[#6B6B6B] font-light">No available times on this date</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8E8E8] rounded-xl sm:rounded-2xl p-2 sm:p-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {availableTimes.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              "py-2 sm:py-2.5 px-1.5 sm:px-2 text-[11px] sm:text-[12px] rounded-lg sm:rounded-xl transition-all duration-200 font-light",
                              selectedTime === time
                                ? "bg-[#8B7355] text-white shadow-md"
                                : "bg-[#F8F7F5] text-[#1A1A1A] hover:bg-[#E8E8E8] hover:shadow-sm active:scale-95"
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8B7355] font-medium">Notes for client (optional)</Label>
                <Textarea
                  placeholder="Any special instructions or notes..."
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  className="resize-none h-20 sm:h-24 bg-white border-[#E8E8E8] focus:border-[#8B7355] text-[13px] sm:text-[14px]"
                />
              </div>

              {/* Price Preview */}
              {selectedServiceData && (
                <div className="bg-gradient-to-br from-[#F8F7F5] to-[#F0F0F0] rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2 border border-[#E8E8E8]">
                  <div className="flex justify-between text-[12px] sm:text-[13px]">
                    <span className="text-[#6B6B6B] font-light">Service</span>
                    <span className="text-[#1A1A1A] font-medium">${parseFloat(selectedServiceData.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[12px] sm:text-[13px]">
                    <span className="text-[#6B6B6B] font-light">Service fee (15%)</span>
                    <span className="text-[#1A1A1A] font-medium">${(parseFloat(selectedServiceData.price) * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[14px] sm:text-[15px] font-medium pt-2 border-t border-[#E8E8E8]/50">
                    <span className="text-[#1A1A1A]">Client pays</span>
                    <span className="text-[#8B7355]">${(parseFloat(selectedServiceData.price) * 1.15).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2 flex-col sm:flex-row">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:flex-1 h-10 sm:h-11 border-[#E8E8E8] hover:bg-[#F8F7F5] text-[13px] sm:text-[14px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail}
                className="w-full sm:flex-1 h-10 sm:h-11 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-colors duration-200 text-[13px] sm:text-[14px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create & Get Link'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-2 sm:space-y-3">
              <DialogTitle className="font-serif font-light text-xl sm:text-2xl flex items-center gap-2 text-[#1A1A1A]">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                Invite Created!
              </DialogTitle>
              <DialogDescription className="text-[12px] sm:text-[13px] text-[#6B6B6B] font-light leading-relaxed">
                Share this link with {clientName} so they can view and pay for their appointment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              {/* Invite Link */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8B7355] font-medium">Invite Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="h-10 sm:h-11 text-[11px] sm:text-[13px] bg-[#F8F7F5] border-[#E8E8E8] font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 border-[#E8E8E8] hover:bg-[#F8F7F5]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={copyLink}
                  className="h-10 sm:h-12 flex items-center gap-1.5 sm:gap-2 border-[#E8E8E8] hover:bg-[#F8F7F5] text-[12px] sm:text-[13px]"
                >
                  <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={sendEmail}
                  className="h-10 sm:h-12 flex items-center gap-1.5 sm:gap-2 border-[#E8E8E8] hover:bg-[#F8F7F5] text-[12px] sm:text-[13px]"
                >
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Email Client
                </Button>
              </div>

              {/* Appointment Summary */}
              <div className="bg-gradient-to-br from-[#F8F7F5] to-[#F0F0F0] rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3 border border-[#E8E8E8]">
                <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#8B7355] font-medium">Appointment Summary</p>
                <div className="space-y-1.5 sm:space-y-2 text-[12px] sm:text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B6B6B] font-light">Client:</span>
                    <span className="text-[#1A1A1A] font-medium truncate">{clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8B7355] flex-shrink-0" />
                    <span className="text-[#1A1A1A] font-light">
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8B7355] flex-shrink-0" />
                    <span className="text-[#1A1A1A] font-light">{selectedTime}</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] sm:text-[11px] text-center text-[#6B6B6B] font-light leading-relaxed px-2">
                The invite expires in 7 days. You'll be notified when {clientName} accepts and pays.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                onClick={() => onOpenChange(false)} 
                className="w-full h-10 sm:h-11 bg-[#1A1A1A] hover:bg-[#8B7355] transition-colors duration-200 text-[13px] sm:text-[14px]"
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
