'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Check, Users, DollarSign, TrendingUp, Wallet, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

interface ReferralStats {
  referralCode: string | null;
  stripeSetupComplete: boolean;
  stats: {
    totalReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    referredTechs: Array<{
      id: number;
      businessName: string | null;
      username: string;
      avatar: string | null;
      joinedAt: string;
    }>;
  };
  recentEarnings: Array<{
    id: number;
    amount: number;
    bookingTotal: number;
    status: string;
    createdAt: string;
  }>;
}

export function TechReferralCard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isNativeIOS, setIsNativeIOS] = useState(false);

  useEffect(() => {
    // Check if running on native iOS - hide referral program for Apple compliance
    const checkPlatform = () => {
      const isNative = Capacitor.isNativePlatform();
      const isIOS = Capacitor.getPlatform() === 'ios';
      setIsNativeIOS(isNative && isIOS);
    };
    checkPlatform();
    
    fetchReferralStats();
  }, []);

  // Don't render on native iOS (Apple compliance - no external payment references)
  if (isNativeIOS) {
    return null;
  }

  const fetchReferralStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tech-referrals', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    if (!stats?.referralCode) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/auth?signup=true&userType=tech&techRef=${stats.referralCode}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareLink = async () => {
    const link = getReferralLink();
    const shareText = `Join me on Ivory's Choice! Use my referral link to sign up as a nail tech and we both benefit. ${link}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Ivory's Choice",
          text: shareText,
          url: link,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="border border-[#E8E8E8] p-6 sm:p-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    );
  }

  // Show setup prompt if Stripe not connected
  if (!stats?.stripeSetupComplete) {
    return (
      <div className="relative overflow-hidden border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-700">
        {/* Elegant gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7F5] via-white to-[#FDF8F3] opacity-50" />
        
        <div className="relative p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B7355]" />
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#8B7355] font-light">
                  Referral Program
                </p>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
                Earn While You Grow
              </h3>
            </div>
          </div>

          {/* Value proposition */}
          <p className="text-base text-[#6B6B6B] font-light leading-relaxed max-w-md">
            Refer other nail techs and earn <span className="text-[#1A1A1A] font-medium">5% of their booking fees</span> — forever. 
            Set up your payout wallet to unlock this feature.
          </p>

          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#E8E8E8]">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A]">5%</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light mt-1">Commission</p>
            </div>
            <div className="text-center border-x border-[#E8E8E8]">
              <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A]">∞</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light mt-1">Lifetime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A]">$0</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light mt-1">To Start</p>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => window.location.href = '/tech/settings?tab=wallet'}
            className="w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 h-12 sm:h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light"
          >
            <Wallet className="w-4 h-4 mr-3" />
            Set Up Payout Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-700">
      {/* Elegant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7F5] via-white to-[#FDF8F3] opacity-50" />
      
      <div className="relative p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8B7355]" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#8B7355] font-light">
                Referral Program
              </p>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
              Grow Your Network
            </h3>
          </div>
          
          {/* Earnings badge */}
          {stats.stats.totalEarnings > 0 && (
            <div className="bg-[#1A1A1A] text-white px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase font-light">
              ${stats.stats.totalEarnings.toFixed(2)} Earned
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#E8E8E8]">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A]">{stats.stats.totalReferrals}</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light mt-1">Referrals</p>
          </div>
          <div className="text-center border-x border-[#E8E8E8]">
            <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A]">${stats.stats.totalEarnings.toFixed(0)}</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light mt-1">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-light text-[#8B7355]">${stats.stats.pendingEarnings.toFixed(0)}</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light mt-1">Pending</p>
          </div>
        </div>

        {/* Referral link section */}
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">
            Your Referral Link
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#F8F7F5] border border-[#E8E8E8] px-4 py-3 text-sm text-[#6B6B6B] font-light truncate">
              {getReferralLink()}
            </div>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-all duration-500 px-4 rounded-none"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Share button */}
        <Button
          onClick={shareLink}
          className="w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 h-12 sm:h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light"
        >
          <Share2 className="w-4 h-4 mr-3" />
          Share & Earn 5%
        </Button>

        {/* How it works */}
        <div className="pt-4 border-t border-[#E8E8E8]">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light hover:text-[#8B7355] transition-colors"
          >
            <span>How It Works</span>
            <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>↓</span>
          </button>
          
          {showDetails && (
            <div className="mt-4 space-y-3 text-sm text-[#6B6B6B] font-light">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 border border-[#E8E8E8] flex items-center justify-center text-[10px] text-[#8B7355] flex-shrink-0">1</div>
                <p>Share your unique referral link with other nail techs</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 border border-[#E8E8E8] flex items-center justify-center text-[10px] text-[#8B7355] flex-shrink-0">2</div>
                <p>When they sign up and complete their profile, they're linked to you</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 border border-[#E8E8E8] flex items-center justify-center text-[10px] text-[#8B7355] flex-shrink-0">3</div>
                <p>You earn 5% of their booking fees — automatically, forever</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 border border-[#E8E8E8] flex items-center justify-center text-[10px] text-[#8B7355] flex-shrink-0">4</div>
                <p>Earnings are deposited directly to your payout wallet</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent referrals */}
        {stats.stats.referredTechs.length > 0 && (
          <div className="pt-4 border-t border-[#E8E8E8]">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light mb-3">
              Your Referrals
            </p>
            <div className="space-y-2">
              {stats.stats.referredTechs.slice(0, 3).map((tech) => (
                <div key={tech.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F8F7F5] border border-[#E8E8E8] flex items-center justify-center">
                      {tech.avatar ? (
                        <img src={tech.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-4 h-4 text-[#8B7355]" />
                      )}
                    </div>
                    <span className="text-sm text-[#1A1A1A] font-light">
                      {tech.businessName || tech.username}
                    </span>
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light">
                    {new Date(tech.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
