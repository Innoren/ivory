"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, Phone, Calendar, CheckCircle } from "lucide-react"

export default function AccountSecurityPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState("")
  
  // Personal info state
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false)
  const [personalInfoMessage, setPersonalInfoMessage] = useState("")
  const [userId, setUserId] = useState<number | null>(null)

  // Load existing personal info
  useEffect(() => {
    const loadPersonalInfo = async () => {
      try {
        // Get user ID from localStorage
        const user = localStorage.getItem("ivoryUser")
        if (user) {
          const userData = JSON.parse(user)
          setUserId(userData.id)
        }

        const response = await fetch('/api/user/update-personal-info')
        if (response.ok) {
          const data = await response.json()
          if (data.dateOfBirth) {
            setDateOfBirth(new Date(data.dateOfBirth).toISOString().split('T')[0])
          }
          if (data.phoneNumber) {
            setPhoneNumber(data.phoneNumber)
          }
          setPhoneVerified(data.phoneVerified || false)
        }
      } catch (error) {
        console.error('Error loading personal info:', error)
      }
    }
    loadPersonalInfo()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage("New passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters")
      return
    }

    setIsUpdating(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        throw new Error("Failed to update password")
      }

      setMessage("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setMessage("Failed to update password. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Send phone verification code
  const handleSendVerificationCode = async () => {
    if (!phoneNumber) {
      setPersonalInfoMessage('Please enter a phone number')
      return
    }

    setSendingCode(true)
    setPersonalInfoMessage('')
    try {
      const response = await fetch('/api/auth/phone/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPersonalInfoMessage(data.error || 'Failed to send verification code')
        return
      }

      setShowVerification(true)
      setPersonalInfoMessage('Verification code sent! Check your phone.')
    } catch (error) {
      console.error('Send code error:', error)
      setPersonalInfoMessage('Failed to send verification code')
    } finally {
      setSendingCode(false)
    }
  }

  // Verify phone code
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setPersonalInfoMessage('Please enter a 6-digit verification code')
      return
    }

    setVerifyingCode(true)
    setPersonalInfoMessage('')
    try {
      const response = await fetch('/api/auth/phone/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code: verificationCode, userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPersonalInfoMessage(data.error || 'Invalid verification code')
        return
      }

      setPhoneVerified(true)
      setShowVerification(false)
      setVerificationCode('')
      setPersonalInfoMessage('Phone number verified!')
    } catch (error) {
      console.error('Verify code error:', error)
      setPersonalInfoMessage('Failed to verify code')
    } finally {
      setVerifyingCode(false)
    }
  }

  // Save personal info (DOB)
  const handleSavePersonalInfo = async () => {
    setSavingPersonalInfo(true)
    setPersonalInfoMessage('')
    
    try {
      const response = await fetch('/api/user/update-personal-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dateOfBirth: dateOfBirth || null,
          phoneNumber: phoneNumber || null,
          phoneVerified
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPersonalInfoMessage(data.error || 'Failed to save')
        return
      }

      setPersonalInfoMessage('Personal info saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      setPersonalInfoMessage('Failed to save personal info')
    } finally {
      setSavingPersonalInfo(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="hover:bg-[#F8F7F5] active:scale-95 transition-all rounded-none"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1} />
          </Button>
          <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
            Account Security
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        {/* Personal Information Section */}
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white mb-6">
          <h2 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight mb-6">Personal Information</h2>
          
          <div className="space-y-5">
            {/* Date of Birth */}
            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
              />
              <p className="text-xs text-[#6B6B6B] mt-1 font-light">Must be at least 13 years old</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Personal Phone Number
                {phoneVerified && (
                  <span className="flex items-center gap-1 text-green-600 normal-case">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value)
                    setPhoneVerified(false)
                    setShowVerification(false)
                  }}
                  placeholder="+1 (555) 123-4567"
                  disabled={phoneVerified}
                  className="flex-1 px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300 disabled:bg-gray-50"
                />
                {!phoneVerified && phoneNumber && (
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={sendingCode}
                    className="px-4 py-3 bg-[#8B7355] text-white text-xs tracking-wider uppercase hover:bg-[#1A1A1A] transition-all duration-300 disabled:opacity-50"
                  >
                    {sendingCode ? 'Sending...' : 'Verify'}
                  </button>
                )}
              </div>
              <p className="text-xs text-[#6B6B6B] mt-1 font-light">Your personal phone number for account verification</p>
              
              {/* Verification Code Input */}
              {showVerification && !phoneVerified && (
                <div className="mt-4 p-4 border border-[#E8E8E8] bg-[#FAFAF8]">
                  <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">Enter 6-digit code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="flex-1 px-4 py-3 text-center tracking-[0.5em] border border-[#E8E8E8] font-medium text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={verifyingCode || verificationCode.length !== 6}
                      className="px-4 py-3 bg-[#1A1A1A] text-white text-xs tracking-wider uppercase hover:bg-[#8B7355] transition-all duration-300 disabled:opacity-50"
                    >
                      {verifyingCode ? 'Verifying...' : 'Confirm'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={sendingCode}
                    className="mt-2 text-xs text-[#8B7355] hover:text-[#1A1A1A] transition-colors"
                  >
                    Resend code
                  </button>
                </div>
              )}
            </div>

            {personalInfoMessage && (
              <p className={`text-sm font-light ${personalInfoMessage.includes("success") || personalInfoMessage.includes("verified") || personalInfoMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                {personalInfoMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleSavePersonalInfo}
              disabled={savingPersonalInfo}
              className="w-full h-12 bg-[#1A1A1A] text-white font-light text-sm tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300"
            >
              {savingPersonalInfo ? "Saving..." : "Save Personal Info"}
            </button>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white mb-6">
          <h2 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight mb-6">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
              />
            </div>

            {message && (
              <p className={`text-sm font-light ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-12 bg-[#1A1A1A] text-white font-light text-sm tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300"
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} />
    </div>
  )
}
