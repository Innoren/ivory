"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Search, Loader2, UserPlus, Copy, Check, Star, MapPin } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { BottomNav } from "@/components/bottom-nav"

interface NailTech {
  id: string
  name: string
  avatar: string
  location: string
  rating: number
  businessName?: string
}

type NailLook = {
  id: string
  imageUrl: string
  title: string
  createdAt: string
}

export default function ShareWithTechPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [look, setLook] = useState<NailLook | null>(null)
  const [techs, setTechs] = useState<NailTech[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTech, setSelectedTech] = useState<NailTech | null>(null)
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [designType, setDesignType] = useState<'look' | 'saved'>('look')

  const PRODUCTION_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ivoryschoice.com"

  useEffect(() => {
    loadDesign()
    loadTechs()
  }, [params.id])

  async function loadDesign() {
    const type = searchParams.get('type')
    
    // Try saved-designs first (more common for new users uploading designs)
    // Include credentials for authentication
    try {
      const response = await fetch(`/api/saved-designs/${params.id}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const design = data.design
        setLook({ id: design.id.toString(), imageUrl: design.imageUrl, title: design.title || 'Saved Design', createdAt: design.createdAt })
        setDesignType('saved')
        return
      }
    } catch (error) {
      console.error('Error loading saved design:', error)
    }

    // If saved design not found, try to load as a look (AI-generated)
    try {
      const response = await fetch(`/api/looks/${params.id}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setLook({ id: data.id.toString(), imageUrl: data.imageUrl, title: data.title, createdAt: data.createdAt })
        setDesignType('look')
        return
      }
    } catch (error) {
      console.error('Error loading look:', error)
    }
  }

  async function loadTechs() {
    setLoading(true)
    try {
      const res = await fetch("/api/tech-profiles")
      if (res.ok) {
        const data = await res.json()
        setTechs(data.map((tech: any) => ({
          id: tech.userId.toString(),
          name: tech.username || tech.businessName || "Nail Tech",
          businessName: tech.businessName,
          avatar: tech.avatar || "/placeholder-user.jpg",
          location: tech.location || "Location not set",
          rating: parseFloat(tech.rating) || 0,
        })))
      }
    } catch (error) {
      console.error("Failed to load techs:", error)
    }
    setLoading(false)
  }

  async function handleSend() {
    if (!selectedTech || !look) return
    setSending(true)
    const userStr = localStorage.getItem("ivoryUser")
    if (!userStr) { router.push("/"); return }
    const user = JSON.parse(userStr)
    const designId = Array.isArray(params.id) ? params.id[0] : (params.id as string)
    
    try {
      // If it's a saved design, we need to create a look first or send the image directly
      let lookIdToSend = parseInt(designId)
      
      if (designType === 'saved') {
        // Create a design request with the saved design's image URL
        const res = await fetch("/api/design-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            savedDesignId: parseInt(designId),
            imageUrl: look.imageUrl,
            clientId: user.id, 
            techId: selectedTech.id, 
            clientMessage: message.trim() || null 
          }),
        })
        if (res.ok) {
          toast.success("Design sent successfully!")
          setSent(true)
        } else {
          const err = await res.json().catch(() => ({}))
          toast.error(err.error || "Failed to send design")
        }
      } else {
        // Original flow for looks
        const res = await fetch("/api/design-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ lookId: lookIdToSend, clientId: user.id, techId: selectedTech.id, clientMessage: message.trim() || null }),
        })
        if (res.ok) {
          toast.success("Design sent successfully!")
          setSent(true)
        } else {
          const err = await res.json().catch(() => ({}))
          toast.error(err.error || "Failed to send design")
        }
      }
    } catch (error) {
      console.error("Error sending design:", error)
      toast.error("An error occurred")
    }
    setSending(false)
  }

  async function handleCopyInviteLink() {
    try {
      await navigator.clipboard.writeText(`${PRODUCTION_URL}/auth?signup=true&type=tech`)
      setCopied(true)
      toast.success("Invite link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy link")
    }
  }

  const filteredTechs = techs.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F8F7F5] flex items-center justify-center">
            <Check className="w-10 h-10 text-[#34C759]" />
          </div>
          <h2 className="font-serif text-3xl font-light text-[#1A1A1A] mb-3">Design Sent! 💅</h2>
          <p className="text-[#6B6B6B] font-light tracking-wide mb-8">{selectedTech?.name} will review your design soon</p>
          <Button onClick={() => router.push("/home")} className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] h-14 px-8 text-[11px] tracking-[0.25em] uppercase rounded-none font-light">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  if (!look && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#6B6B6B] font-light tracking-wide">Design not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-5">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#1A1A1A] hover:text-[#8B7355] min-h-[44px]">
            <ArrowLeft className="w-5 h-5" strokeWidth={1} />
            <span className="text-[10px] tracking-[0.25em] uppercase font-light">Back</span>
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-28">
        <div className="mb-8 sm:mb-12 text-center">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3 font-light">Share Your Design</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">Send to Your Nail Tech 💅</h1>
        </div>
        {look && (
          <div className="mb-8 sm:mb-12">
            <div className="aspect-square relative overflow-hidden border border-[#E8E8E8] bg-[#F8F7F5] max-w-sm mx-auto">
              <Image src={look.imageUrl || "/placeholder.svg"} alt="Your design" fill className="object-cover" priority sizes="384px" />
            </div>
          </div>
        )}
        {/* Message input - shown when tech is selected */}
        {selectedTech && (
          <div className="mb-6">
            <label className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-3 block font-light">Add a Message (Optional)</label>
            <Textarea placeholder="Any special requests or notes..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="border-[#E8E8E8] rounded-none text-sm font-light resize-none bg-[#F8F7F5]" />
          </div>
        )}

        {/* Send button - ABOVE nail techs on mobile for better UX */}
        <Button onClick={handleSend} disabled={!selectedTech || sending || loading} className="w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light disabled:opacity-50 mb-8">
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-3" strokeWidth={1.5} />{selectedTech ? `Send to ${selectedTech.name}` : "Select a Nail Tech"}</>}
        </Button>

        <div className="mb-6">
          <label className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-3 block font-light flex items-center gap-2">
            <Search className="w-4 h-4" strokeWidth={1.5} />
            Find Your Nail Tech
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" strokeWidth={1.5} />
            <Input placeholder="Search by name or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 border-[#E8E8E8] rounded-none text-sm font-light bg-[#F8F7F5]" />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" /></div>
        ) : techs.length === 0 ? (
          <div className="text-center py-12 border border-[#E8E8E8] bg-[#F8F7F5] mb-8">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-[#8B7355]" strokeWidth={1} />
            <p className="text-[#6B6B6B] font-light mb-6">No nail techs available yet</p>
            <Button onClick={handleCopyInviteLink} className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] h-12 px-6 text-[10px] tracking-[0.2em] uppercase rounded-none font-light">
              {copied ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Invite Link</>}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto">
            {filteredTechs.map((tech) => (
              <button key={tech.id} onClick={() => setSelectedTech(tech)} className={`w-full border p-4 text-left transition-all ${selectedTech?.id === tech.id ? "border-[#8B7355] bg-[#F8F7F5]" : "border-[#E8E8E8] bg-white hover:border-[#D0D0D0]"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#F8F7F5] flex-shrink-0 border border-[#E8E8E8]">
                    <Image src={tech.avatar} alt={tech.name} width={56} height={56} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#1A1A1A] truncate">{tech.name}</h3>
                    {tech.businessName && tech.businessName !== tech.name && <p className="text-sm text-[#8B7355] truncate">{tech.businessName}</p>}
                    <div className="flex items-center gap-3 text-xs text-[#6B6B6B] mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" strokeWidth={1.5} /><span className="truncate">{tech.location}</span></span>
                      {tech.rating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />{tech.rating.toFixed(1)}</span>}
                    </div>
                  </div>
                  {selectedTech?.id === tech.id && <div className="w-8 h-8 rounded-full bg-[#8B7355] flex items-center justify-center flex-shrink-0"><Check className="w-5 h-5 text-white" strokeWidth={2} /></div>}
                </div>
              </button>
            ))}
            {filteredTechs.length === 0 && <p className="text-center text-[#6B6B6B] py-12 font-light">No techs found</p>}
          </div>
        )}
        <div className="mt-8 border border-[#E8E8E8] p-6 bg-[#F8F7F5] text-center">
          <p className="text-sm text-[#6B6B6B] leading-relaxed font-light">Your nail tech will receive your design and can use it as inspiration for your next appointment.</p>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
