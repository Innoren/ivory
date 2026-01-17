'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, MapPin, Star, Loader2, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import Image from 'next/image';
import { isNativeIOS } from '@/lib/native-bridge';

const CONVENIENCE_FEE_PERCENT = 0.15;

const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.haptics) {
    (window as any).webkit.messageHandlers.haptics.postMessage({ style });
  }
};

export default function BookingInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    fetchInvite();
    checkUserSession();
  }, [token]);

  const checkUserSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (data.user.token) {
          localStorage.setItem('token', data.user.token);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const fetchInvite = async () => {
    try {
      const response = await fetch(`/api/bookings/invite/${token}`);
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to load invite');
        return;
      }
      
      setInvite(data.booking);
    } catch (error) {
      console.error('Error fetching invite:', error);
      setError('Failed to load invite');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!currentUser) {
      // Store return URL for after auth (same pattern as other pages)
      localStorage.setItem('returnUrl', `/booking/invite/${token}`);
      router.push('/auth');
      return;
    }

    setAccepting(true);
    triggerHaptic('medium');

    try {
      const response = await fetch(`/api/bookings/invite/${token}`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to accept invite');
        return;
      }

      setAccepted(true);
      triggerHaptic('success');
      
      // Proceed to payment
      await handlePayment(data.booking.id);
    } catch (error) {
      console.error('Error accepting invite:', error);
      setError('Failed to accept invite');
    } finally {
      setAccepting(false);
    }
  };

  const handlePayment = async (bookingId: number) => {
    try {
      const response = await fetch('/api/stripe/create-booking-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create payment session');
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating payment:', error);
      setError('Failed to process payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light">Loading invite</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-lg font-medium text-[#1A1A1A]">Invite Error</h1>
          <p className="text-[13px] text-[#6B6B6B]">{error}</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!invite) return null;

  const appointmentDate = new Date(invite.appointmentDate);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] pb-40 lg:pb-28">
      {/* Header */}
      <header className={`bg-white/95 backdrop-blur-xl border-b border-[#E8E8E8]/80 sticky top-0 z-50 ${isNativeIOS() ? 'pt-[60px]' : 'pt-[env(safe-area-inset-top)]'}`}>
        <div className={`max-w-2xl mx-auto px-4 py-3 ${isNativeIOS() ? 'pt-6' : ''}`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                triggerHaptic('light');
                router.back();
              }} 
              className="h-10 w-10 flex items-center justify-center hover:bg-[#F8F7F5] rounded-full active:scale-90 transition-all duration-150"
            >
              <ArrowLeft className="h-5 w-5 text-[#8B7355]" strokeWidth={2} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-[15px] text-[#1A1A1A]">Appointment Invite</h1>
              <p className="text-[12px] text-[#6B6B6B]">From {invite.tech.businessName || invite.tech.username}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Invite Banner */}
        <div className="bg-gradient-to-r from-[#8B7355] to-[#A08060] rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-[14px]">You've been invited!</p>
              <p className="text-[12px] text-white/80">
                {invite.tech.businessName || invite.tech.username} has created an appointment for you
              </p>
            </div>
          </div>
        </div>

        {/* Tech Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E8E8]/50">
          <div className="flex items-center gap-3">
            {invite.tech.portfolioImage ? (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={invite.tech.portfolioImage}
                  alt={invite.tech.businessName || 'Tech'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#F8F7F5] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#8B7355]" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-[15px] text-[#1A1A1A] truncate">
                {invite.tech.businessName || invite.tech.username}
              </h2>
              {invite.tech.location && (
                <div className="flex items-center gap-1 text-[12px] text-[#6B6B6B]">
                  <MapPin className="w-3 h-3" strokeWidth={2} />
                  <span className="truncate">{invite.tech.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-[#8B7355] text-[#8B7355]" />
                <span className="text-[12px] text-[#1A1A1A] font-medium">{invite.tech.rating || '5.0'}</span>
                <span className="text-[12px] text-[#6B6B6B]">({invite.tech.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8E8E8]/50">
          <div className="px-4 py-3 border-b border-[#E8E8E8]/50 bg-[#F8F7F5]">
            <span className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B] font-light">Appointment Details</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Service */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[14px] font-medium text-[#1A1A1A]">{invite.service.name}</h3>
                {invite.service.description && (
                  <p className="text-[12px] text-[#6B6B6B] mt-0.5">{invite.service.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-[12px] text-[#6B6B6B]">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{invite.service.duration || invite.duration}min</span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-3 p-3 bg-[#F8F7F5] rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-[#8B7355]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1A1A1A]">
                  {appointmentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-[12px] text-[#6B6B6B]">
                  {appointmentDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </p>
              </div>
            </div>

            {/* Notes from tech */}
            {invite.techNotes && (
              <div className="p-3 bg-[#FFF9F0] rounded-xl border border-[#F0E6D8]">
                <p className="text-[11px] tracking-[0.1em] uppercase text-[#8B7355] font-medium mb-1">Note from tech</p>
                <p className="text-[13px] text-[#1A1A1A]">{invite.techNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Invite Expiration */}
        {invite.inviteExpiresAt && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-[12px] text-amber-700">
              This invite expires on {new Date(invite.inviteExpiresAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom - Payment Summary */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E8E8] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Price Breakdown */}
          <div className="mb-3 pb-3 border-b border-[#E8E8E8]/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-medium text-[#1A1A1A]">{invite.service.name}</p>
              <p className="text-[13px] text-[#1A1A1A]">${parseFloat(invite.servicePrice).toFixed(2)}</p>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <p className="text-[12px] text-[#6B6B6B]">Convenience fee (15%)</p>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-[#8B7355] cursor-help" strokeWidth={2} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1A1A1A] text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    This fee helps us maintain the platform and ensure secure payments.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A1A1A]" />
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-[#6B6B6B]">${parseFloat(invite.serviceFee).toFixed(2)}</p>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#E8E8E8]">
              <p className="text-[14px] font-semibold text-[#1A1A1A]">Total</p>
              <p className="text-[18px] font-semibold text-[#1A1A1A]">${parseFloat(invite.totalPrice).toFixed(2)}</p>
            </div>
          </div>
          
          {accepted ? (
            <div className="flex items-center justify-center gap-2 py-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-[13px] text-green-600 font-medium">Redirecting to payment...</span>
            </div>
          ) : (
            <Button
              onClick={handleAcceptInvite}
              disabled={accepting}
              className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-12 text-[13px] font-medium rounded-xl transition-all duration-300 disabled:opacity-40 active:scale-[0.98]"
            >
              {accepting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentUser ? (
                'Accept & Pay'
              ) : (
                'Log in to Accept'
              )}
            </Button>
          )}
          
          <p className="text-[10px] text-center text-[#6B6B6B] mt-2">
            Secure payment via Stripe • Booking confirmed after payment
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
