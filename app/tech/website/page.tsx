"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  Loader2, 
  Send, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Palette,
  Type,
  Layout,
  Check,
  X,
  Globe,
  MessageSquare,
  Settings,
  Image as ImageIcon
} from "lucide-react"
import { WebsiteRenderer } from "@/components/website-builder/website-renderer"

import { BottomNav } from "@/components/bottom-nav"

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
  { value: 'Montserrat', label: 'Montserrat (Bold)' },
  { value: 'Lora', label: 'Lora (Sophisticated)' },
  { value: 'Poppins', label: 'Poppins (Friendly)' },
]

export default function WebsiteBuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [websiteData, setWebsiteData] = useState<any>(null)
  const [techProfile, setTechProfile] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [portfolioImages, setPortfolioImages] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [availability, setAvailability] = useState<any[]>([])
  
  // Website settings
  const [subdomain, setSubdomain] = useState('')
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [checkingSubdomain, setCheckingSubdomain] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#1A1A1A')
  const [secondaryColor, setSecondaryColor] = useState('#8B7355')
  const [accentColor, setAccentColor] = useState('#F5F5F5')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [isPublished, setIsPublished] = useState(true)
  const [sections, setSections] = useState<any[]>([])
  
  // UI state
  const [activeTab, setActiveTab] = useState<'preview' | 'chat' | 'settings'>('preview')
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingChat, setSendingChat] = useState(false)
  const [isLocalhost, setIsLocalhost] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLocalhost(window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))
    }
  }, [])

  // Load website data
  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/auth")
          return
        }

        const user = JSON.parse(userStr)
        setUserId(user.id)

        const response = await fetch(`/api/tech/website?userId=${user.id}`)
        if (!response.ok) {
          // Fallback: Try fetching just the profile
          console.log('Main website fetch failed, trying profile fallback...')
          const profileRes = await fetch(`/api/tech-profiles?userId=${user.id}`)
          
          if (profileRes.ok) {
            const profile = await profileRes.json()
            if (profile) {
              setTechProfile(profile)
              setLoading(false)
              return
            }
          }
          
          throw new Error('Failed to load website data')
        }

        const data = await response.json()
        setTechProfile(data.techProfile)
        setServices(data.services || [])
        setPortfolioImages(data.portfolioImages || [])
        setReviews(data.reviews || [])
        setAvailability(data.availability || [])

        if (data.website) {
          setWebsiteData(data.website)
          setSubdomain(data.website.subdomain || '')
          setPrimaryColor(data.website.primaryColor || '#1A1A1A')
          setSecondaryColor(data.website.secondaryColor || '#8B7355')
          setAccentColor(data.website.accentColor || '#F5F5F5')
          setFontFamily(data.website.fontFamily || 'Inter')
          setIsPublished(data.website.isPublished ?? true)
          setSections(data.website.sections || [])
        }

        // Load chat history
        const chatResponse = await fetch(`/api/tech/website/chat?userId=${user.id}`)
        if (chatResponse.ok) {
          const chatData = await chatResponse.json()
          setChatMessages(chatData.messages || [])
        }
      } catch (error) {
        console.error('Error loading website:', error)
        toast({
          title: "Error",
          description: "Failed to load website data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, toast])

  // Check subdomain availability
  useEffect(() => {
    const checkSubdomain = async () => {
      if (!subdomain || subdomain.length < 3) {
        setSubdomainAvailable(null)
        return
      }

      setCheckingSubdomain(true)
      try {
        const response = await fetch(
          `/api/tech/website/check-subdomain?subdomain=${subdomain}&websiteId=${websiteData?.id || ''}`
        )
        const data = await response.json()
        setSubdomainAvailable(data.available)
      } catch (error) {
        setSubdomainAvailable(null)
      } finally {
        setCheckingSubdomain(false)
      }
    }

    const debounce = setTimeout(checkSubdomain, 500)
    return () => clearTimeout(debounce)
  }, [subdomain, websiteData?.id])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSaveWebsite = async () => {
    if (!userId || !subdomain) {
      toast({
        title: "Missing subdomain",
        description: "Please enter a subdomain for your website",
        variant: "destructive",
      })
      return
    }

    if (subdomainAvailable === false) {
      toast({
        title: "Subdomain unavailable",
        description: "Please choose a different subdomain",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/tech/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subdomain,
          primaryColor,
          secondaryColor,
          accentColor,
          fontFamily,
          isPublished,
          sections,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save website')
      }

      const data = await response.json()
      setWebsiteData(data.website)
      setSections(data.website.sections || [])

      toast({
        title: "Website saved",
        description: isPublished 
          ? `Your website is live at ${subdomain}.ivoryschoice.com`
          : "Your website has been saved as a draft",
      })
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save website",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || !userId) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setSendingChat(true)

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/tech/website/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: userMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process chat')
      }

      const data = await response.json()
      
      // Add assistant response
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

      // Update website if changes were made
      if (data.website) {
        setWebsiteData(data.website)
        setPrimaryColor(data.website.primaryColor || primaryColor)
        setSecondaryColor(data.website.secondaryColor || secondaryColor)
        setAccentColor(data.website.accentColor || accentColor)
        setFontFamily(data.website.fontFamily || fontFamily)
        setSections(data.website.sections || sections)
      }
    } catch (error) {
      toast({
        title: "Chat error",
        description: "Failed to process your request",
        variant: "destructive",
      })
      // Remove the user message on error
      setChatMessages(prev => prev.slice(0, -1))
    } finally {
      setSendingChat(false)
    }
  }

  const toggleSectionVisibility = (sectionId: number) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    )
  }

  if (!techProfile) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex flex-col pb-24">
        {/* Header */}
        <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-none mr-2"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1} />
            </Button>
            <h1 className="font-serif text-xl font-light text-[#1A1A1A]">Website Builder</h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md w-full bg-white p-8 border border-[#E8E8E8] shadow-sm">
            <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mb-4">Complete Your Profile First</h2>
            <p className="text-[#6B6B6B] mb-8 font-light leading-relaxed">
              You need to set up your tech profile before creating a website. This ensures your website has all the necessary information for your clients.
            </p>
            <Button 
              onClick={() => router.push('/tech/profile-setup')}
              className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white rounded-none h-12 uppercase tracking-widest text-xs"
            >
              Set Up Profile
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  // Build preview data
  const previewWebsite = {
    ...websiteData,
    primaryColor,
    secondaryColor,
    accentColor,
    fontFamily,
    isPublished,
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-none"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1} />
            </Button>
            <div>
              <h1 className="font-serif text-xl font-light text-[#1A1A1A]">Website Builder</h1>
              <p className="text-xs text-[#6B6B6B]">
                {websiteData ? `${subdomain}.ivoryschoice.com` : 'Create your booking website'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {websiteData && isPublished && (
              <a 
                href={isLocalhost 
                  ? `/?subdomain=${subdomain}`
                  : `https://${subdomain}.ivoryschoice.com`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="rounded-none gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Live
                </Button>
              </a>
            )}
            <Button 
              onClick={handleSaveWebsite}
              disabled={saving || !subdomain || subdomainAvailable === false}
              className="rounded-none bg-[#1A1A1A] hover:bg-[#8B7355]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {websiteData ? 'Save Changes' : 'Create Website'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-[#E8E8E8] flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-[#E8E8E8]">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 text-xs tracking-[0.15em] uppercase font-light transition-colors ${
                activeTab === 'preview' ? 'text-[#8B7355] border-b-2 border-[#8B7355]' : 'text-[#6B6B6B]'
              }`}
            >
              <Layout className="w-4 h-4 mx-auto mb-1" />
              Sections
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs tracking-[0.15em] uppercase font-light transition-colors ${
                activeTab === 'chat' ? 'text-[#8B7355] border-b-2 border-[#8B7355]' : 'text-[#6B6B6B]'
              }`}
            >
              <MessageSquare className="w-4 h-4 mx-auto mb-1" />
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-xs tracking-[0.15em] uppercase font-light transition-colors ${
                activeTab === 'settings' ? 'text-[#8B7355] border-b-2 border-[#8B7355]' : 'text-[#6B6B6B]'
              }`}
            >
              <Settings className="w-4 h-4 mx-auto mb-1" />
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'preview' && (
              <div className="p-4 space-y-4">
                <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] font-light">
                  Toggle Sections
                </p>
                {sections.map((section) => (
                  <div 
                    key={section.id}
                    className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded"
                  >
                    <span className="text-sm capitalize">{section.sectionType}</span>
                    <Switch
                      checked={section.isVisible}
                      onCheckedChange={() => toggleSectionVisibility(section.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 mx-auto mb-3 text-[#8B7355]" />
                      <p className="text-sm text-[#6B6B6B] font-light">
                        Describe what you want to change and I'll update your website automatically.
                      </p>
                      <p className="text-xs text-[#8B8B8B] mt-2">
                        Try: "Make it darker" or "Hide the reviews section"
                      </p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded text-sm ${
                        msg.role === 'user' 
                          ? 'bg-[#1A1A1A] text-white ml-8' 
                          : 'bg-[#F8F7F5] text-[#1A1A1A] mr-8'
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {sendingChat && (
                    <div className="flex items-center gap-2 text-[#6B6B6B] text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Thinking...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-[#E8E8E8]">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                      placeholder="Describe changes..."
                      className="rounded-none text-base"
                      disabled={sendingChat}
                    />
                    <Button
                      onClick={handleSendChat}
                      disabled={sendingChat || !chatInput.trim()}
                      className="rounded-none bg-[#8B7355]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-4 space-y-6">
                {/* Subdomain */}
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2 font-light">
                    Subdomain
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="yourname"
                      className="rounded-none text-base"
                    />
                    <span className="text-sm text-[#6B6B6B] whitespace-nowrap">.ivoryschoice.com</span>
                  </div>
                  {subdomain && (
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      {checkingSubdomain ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#6B6B6B]" />
                      ) : subdomainAvailable ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">Available</span>
                        </>
                      ) : subdomainAvailable === false ? (
                        <>
                          <X className="w-3 h-3 text-red-500" />
                          <span className="text-red-500">Not available</span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Published */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-light">Published</p>
                    <p className="text-xs text-[#6B6B6B]">Make your website visible</p>
                  </div>
                  <Switch
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>

                {/* Colors */}
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-3 font-light flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Colors
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Primary</span>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Secondary</span>
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accent</span>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Font */}
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-3 font-light flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Font
                  </p>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full h-10 px-3 border border-[#E8E8E8] rounded-none text-sm"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-white">
          {sections.length > 0 ? (
            <WebsiteRenderer
              website={previewWebsite}
              sections={sections}
              techProfile={techProfile}
              user={techProfile.user}
              services={services}
              portfolioImages={portfolioImages}
              reviews={reviews}
              availability={availability}
              subdomain={subdomain || 'preview'}
              isPreview={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Globe className="w-12 h-12 mx-auto mb-4 text-[#8B7355]" />
                <h2 className="text-xl font-light text-[#1A1A1A] mb-2">Create Your Website</h2>
                <p className="text-sm text-[#6B6B6B] max-w-md">
                  Enter a subdomain and save to generate your professional booking website.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
