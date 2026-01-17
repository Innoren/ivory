"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, MessageCircle, Plus, Sparkles, Clock, CheckCircle2, Coins, Calendar, User, Eye } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"
import { CreditsDisplay } from "@/components/credits-display"
import { BuyCreditsDialog } from "@/components/buy-credits-dialog"
import { AnimatedTabs } from "@/components/animated-tabs"
import CustomerServiceChatbot from "@/components/customer-service-chatbot"

type ClientRequest = {
  id: string
  clientName: string
  designImage: string
  message: string
  status: "pending" | "approved" | "modified"
  date: string
}

type PersonalDesign = {
  id: string
  title: string
  imageUrl: string
  createdAt: string
}

export default function TechDashboardPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [personalDesigns, setPersonalDesigns] = useState<PersonalDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("requests")
  const [subscriptionTier, setSubscriptionTier] = useState('free')
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['requests', 'approved', 'designs', 'gallery'].includes(tabParam)) {
      setActiveTab(tabParam)
    }

    const loadData = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        
        setSubscriptionTier(user.subscriptionTier || 'free')
        setSubscriptionStatus(user.subscriptionStatus || 'inactive')
        
        const requestsRes = await fetch(`/api/design-requests?techId=${user.id}`)
        if (requestsRes.ok) {
          const data = await requestsRes.json()
          
          const formattedRequests = data.map((req: any) => ({
            id: req.id.toString(),
            clientName: req.client?.username || `Client ${req.clientId}`,
            designImage: req.look?.imageUrl || "/placeholder.svg",
            message: req.clientMessage || "",
            status: req.status,
            date: req.createdAt,
          }))
          
          setRequests(formattedRequests)
        }

        const imagesRes = await fetch(`/api/portfolio-images?userId=${user.id}`)
        if (imagesRes.ok) {
          const data = await imagesRes.json()
          setPortfolioImages(data.images?.map((img: any) => img.imageUrl) || [])
        }

        const looksRes = await fetch(`/api/looks?userId=${user.id}`)
        if (looksRes.ok) {
          const looksData = await looksRes.json()
          setPersonalDesigns(
            looksData.map((look: any) => ({
              id: look.id.toString(),
              title: look.title,
              imageUrl: look.imageUrl,
              createdAt: look.createdAt,
            }))
          )
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/design-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' }),
      })

      if (response.ok) {
        setRequests(requests.map((req) => (req.id === id ? { ...req, status: "approved" as const } : req)))
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleRequestModification = (id: string) => {
    router.push(`/tech/review/${id}`)
  }

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* Elegant Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 pt-safe">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-5">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
              Dashboard
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#F8F7F5] border border-[#E8E8E8] rounded-none">
                <CreditsDisplay showLabel={false} className="text-xs sm:text-sm font-light" />
              </div>
              {subscriptionTier !== 'free' && subscriptionStatus === 'active' ? (
                <BuyCreditsDialog>
                  <Button 
                    size="sm" 
                    className="hidden sm:flex gap-2 h-9 sm:h-10 px-4 sm:px-5 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-700 text-[10px] tracking-[0.2em] uppercase font-light rounded-none hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Coins className="w-3.5 h-3.5" strokeWidth={1} />
                    Buy
                  </Button>
                </BuyCreditsDialog>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => router.push('/billing')}
                  className="hidden sm:flex gap-2 h-9 sm:h-10 px-4 sm:px-5 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-700 text-[10px] tracking-[0.2em] uppercase font-light rounded-none hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1} />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-8 lg:py-10 pb-safe">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-5 sm:mb-8 grid grid-cols-4 h-auto bg-white border border-[#E8E8E8] p-0 rounded-none shadow-sm">

            <TabsTrigger 
              value="requests" 
              className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-700 font-light"
            >
              <Clock className="w-3.5 h-3.5 mr-1 sm:mr-1.5" strokeWidth={1} />
              <span className="hidden xs:inline">Requests</span>
              <span className="xs:hidden">New</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approved" 
              className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-700 font-light"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 sm:mr-1.5" strokeWidth={1} />
              <span className="hidden xs:inline">Approved</span>
              <span className="xs:hidden">Done</span>
            </TabsTrigger>
            <TabsTrigger 
              value="designs" 
              className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-700 font-light"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 sm:mr-1.5" strokeWidth={1} />
              <span className="hidden xs:inline">Designs</span>
              <span className="xs:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger 
              value="gallery" 
              className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-700 font-light"
            >
              <svg className="w-3.5 h-3.5 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden xs:inline">Gallery</span>
              <span className="xs:hidden">Work</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4 sm:space-y-6">

            {requests
              .filter((req) => req.status === "pending")
              .map((request) => (
                <Card 
                  key={request.id} 
                  className="group overflow-hidden border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-2xl hover:shadow-[#8B7355]/5 transition-all duration-700 bg-white rounded-none"
                >
                  <CardContent className="p-0">
                    {/* Mobile Layout - Stacked */}
                    <div className="sm:hidden">
                      <div 
                        className="relative aspect-square w-full bg-gradient-to-br from-[#F8F7F5] to-white cursor-pointer"
                        onClick={() => router.push(`/tech/request/${request.id}`)}
                      >
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Client design"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-[#8B7355] text-white border-0 shadow-lg text-[9px] tracking-[0.15em] uppercase font-light px-2.5 py-1">
                            New
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="text-center mb-4">
                          <h3 className="font-serif text-xl font-light text-[#1A1A1A] mb-1.5 tracking-[-0.01em]">
                            {request.clientName}
                          </h3>
                          <div className="flex items-center justify-center gap-1.5 text-xs text-[#6B6B6B] font-light">
                            <Clock className="w-3 h-3" strokeWidth={1} />
                            <span>
                              {new Date(request.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {request.message && (
                          <div className="mb-5 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
                            <p className="text-xs text-[#6B6B6B] leading-relaxed line-clamp-2 font-light text-center">
                              {request.message}
                            </p>
                          </div>
                        )}

                        {/* Centered Buttons */}
                        <div className="flex flex-col gap-2.5">
                          <div className="flex gap-2 justify-center">
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(request.id)} 
                              className="flex-1 max-w-[140px] h-11 text-[10px] tracking-[0.15em] uppercase font-light bg-[#1A1A1A] hover:bg-[#8B7355] text-white rounded-none"
                            >
                              <Check className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => router.push(`/tech/request/${request.id}`)}
                              className="flex-1 max-w-[140px] h-11 text-[10px] tracking-[0.15em] uppercase font-light border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white rounded-none"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout - Side by Side */}
                    <div className="hidden sm:flex gap-0">
                      <div 
                        className="w-64 md:w-72 lg:w-80 h-auto relative flex-shrink-0 bg-gradient-to-br from-[#F8F7F5] to-white cursor-pointer"
                        onClick={() => router.push(`/tech/request/${request.id}`)}
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={request.designImage || "/placeholder.svg"}
                            alt="Client design"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                            unoptimized
                          />
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-[#8B7355] text-white border-0 shadow-lg text-[9px] tracking-[0.15em] uppercase font-light px-2.5 py-1">
                            New
                          </Badge>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 p-6 lg:p-8">
                        <div className="mb-5">
                          <h3 className="font-serif text-2xl lg:text-3xl font-light text-[#1A1A1A] mb-2 tracking-[-0.01em]">
                            {request.clientName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm text-[#6B6B6B] font-light">
                            <Clock className="w-3.5 h-3.5" strokeWidth={1} />
                            <span>
                              {new Date(request.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {request.message && (
                          <div className="mb-6 p-4 bg-[#F8F7F5] border border-[#E8E8E8]">
                            <p className="text-sm text-[#6B6B6B] leading-relaxed line-clamp-3 font-light tracking-wide">
                              {request.message}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(request.id)} 
                            className="h-11 px-6 text-[10px] tracking-[0.2em] uppercase font-light bg-[#1A1A1A] hover:bg-[#8B7355] text-white rounded-none"
                          >
                            <Check className="w-3.5 h-3.5 mr-1.5" strokeWidth={1} />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => router.push(`/tech/request/${request.id}`)}
                            className="h-11 px-5 text-[10px] tracking-[0.2em] uppercase font-light border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white rounded-none"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" strokeWidth={1} />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "pending").length === 0 && (
              <div className="p-12 sm:p-20 lg:p-24 text-center border border-[#E8E8E8] bg-white rounded-none">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center rounded-none">
                    <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-[#8B7355]" strokeWidth={1} />
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-3 tracking-[-0.01em]">All Caught Up</h3>
                  <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-relaxed tracking-wide">No pending requests</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 sm:space-y-5">
            {requests
              .filter((req) => req.status === "approved")
              .map((request) => (
                <Card 
                  key={request.id} 
                  className="group overflow-hidden border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700 bg-white cursor-pointer rounded-none"
                  onClick={() => router.push(`/tech/request/${request.id}`)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-3 sm:gap-4 items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 relative overflow-hidden flex-shrink-0 border border-[#E8E8E8] rounded-none bg-[#F8F7F5]">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Approved design"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-1000"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg sm:text-xl font-light text-[#1A1A1A] mb-2 sm:mb-3 truncate tracking-[-0.01em]">
                          {request.clientName}
                        </h3>
                        <Badge className="bg-green-500 text-white border-0 text-[9px] tracking-[0.15em] uppercase font-light px-2.5 py-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={1} />
                          Approved
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hidden sm:flex h-9 px-4 hover:bg-[#F8F7F5] hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 text-[10px] tracking-[0.2em] uppercase font-light rounded-none"
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "approved").length === 0 && (
              <div className="p-12 sm:p-20 lg:p-24 text-center border border-[#E8E8E8] bg-white rounded-none">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center rounded-none">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#8B7355]" strokeWidth={1} />
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-3 tracking-[-0.01em]">No Approved Designs</h3>
                  <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-relaxed tracking-wide">Approved requests will appear here</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="designs" className="space-y-5 sm:space-y-8">
            {subscriptionTier !== 'free' && subscriptionStatus === 'active' ? (
              <Card className="border border-[#E8E8E8] bg-white shadow-sm rounded-none">
                <CardContent className="p-5 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F8F7F5] border border-[#E8E8E8] flex items-center justify-center rounded-none flex-shrink-0">
                        <Coins className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355]" strokeWidth={1} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs sm:text-sm font-light tracking-wide text-[#6B6B6B]">Your Credits</span>
                          <CreditsDisplay showLabel={false} className="text-2xl sm:text-3xl font-light text-[#1A1A1A]" />
                        </div>
                        <p className="text-xs sm:text-sm text-[#6B6B6B] font-light tracking-wide">1 credit per design</p>
                      </div>
                    </div>
                    <BuyCreditsDialog>
                      <Button 
                        size="sm"
                        className="h-10 sm:h-11 px-5 sm:px-6 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-700 text-[10px] tracking-[0.2em] uppercase font-light hover:scale-[1.02] active:scale-[0.98] rounded-none"
                      >
                        <Coins className="w-3.5 h-3.5 mr-1.5" strokeWidth={1} />
                        Buy
                      </Button>
                    </BuyCreditsDialog>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-[#E8E8E8] bg-white shadow-sm rounded-none">
                <CardContent className="p-5 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F8F7F5] border border-[#E8E8E8] flex items-center justify-center rounded-none flex-shrink-0">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355]" strokeWidth={1} />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg sm:text-xl font-light text-[#1A1A1A] mb-2 tracking-[-0.01em]">
                          Upgrade Your Plan
                        </h3>
                        <p className="text-xs sm:text-sm text-[#6B6B6B] font-light leading-relaxed tracking-wide max-w-lg">
                          Get monthly credits and purchase more anytime
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => router.push('/billing')}
                      size="sm"
                      className="h-10 sm:h-11 px-5 sm:px-6 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-700 whitespace-nowrap text-[10px] tracking-[0.2em] uppercase font-light hover:scale-[1.02] active:scale-[0.98] rounded-none"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" strokeWidth={1} />
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {personalDesigns.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A] mb-2 tracking-[-0.01em]">
                      AI Designs
                    </h2>
                    <p className="text-sm text-[#6B6B6B] font-light tracking-wide">
                      {personalDesigns.length} {personalDesigns.length === 1 ? 'design' : 'designs'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push("/capture")}
                    className="h-12 px-6 bg-[#1A1A1A] hover:bg-[#8B7355] text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 text-[11px] tracking-[0.25em] uppercase font-light rounded-none"
                  >
                    <Plus className="w-4 h-4 mr-2" strokeWidth={1} />
                    <span className="hidden sm:inline">Create New</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {personalDesigns.map((design) => (
                    <Card 
                      key={design.id} 
                      className="group overflow-hidden border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-2xl hover:shadow-[#8B7355]/5 transition-all duration-700 bg-white rounded-none"
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#F8F7F5] to-white">
                          <Image
                            src={design.imageUrl}
                            alt={design.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                            unoptimized
                          />
                          
                          {/* Action Buttons Overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4 sm:p-6">
                            <div className="flex items-center justify-between gap-2">
                              {/* Delete - Left */}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (!confirm('Are you sure you want to delete this design?')) return
                                  try {
                                    const response = await fetch(`/api/looks/${design.id}`, {
                                      method: 'DELETE',
                                    })
                                    if (response.ok) {
                                      setPersonalDesigns(personalDesigns.filter(d => d.id !== design.id))
                                    } else {
                                      alert('Failed to delete design')
                                    }
                                  } catch (error) {
                                    console.error('Error deleting design:', error)
                                    alert('An error occurred')
                                  }
                                }}
                                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[70px] active:scale-95 transition-transform touch-manipulation"
                              >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </div>
                                <span className="text-[8px] sm:text-[9px] text-white font-light tracking-wider uppercase">Delete</span>
                              </button>

                              {/* Visualize - Center */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  localStorage.setItem('loadedDesignImage', design.imageUrl)
                                  localStorage.setItem('autoShowConfirmDialog', 'true')
                                  localStorage.setItem('loadedDesignMetadata', JSON.stringify({
                                    source: 'ai-generated',
                                    lookId: design.id,
                                    title: design.title
                                  }))
                                  router.push('/capture')
                                }}
                                disabled={subscriptionTier === 'free' || subscriptionStatus !== 'active'}
                                className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[90px] active:scale-95 transition-transform touch-manipulation disabled:opacity-50"
                              >
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#8B7355] flex items-center justify-center hover:bg-[#A0826D] transition-colors shadow-lg">
                                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" strokeWidth={1.5} />
                                </div>
                                <span className="text-[8px] sm:text-[9px] text-white font-light tracking-wider uppercase">Visualize</span>
                              </button>

                              {/* Share - Right */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/share/${design.id}`)
                                }}
                                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[70px] active:scale-95 transition-transform touch-manipulation"
                              >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                  </svg>
                                </div>
                                <span className="text-[8px] sm:text-[9px] text-white font-light tracking-wider uppercase">Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 sm:p-7">
                          <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-3 truncate group-hover:text-[#8B7355] transition-colors duration-700 tracking-[-0.01em]">
                            {design.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-light">
                            <Sparkles className="w-4 h-4" strokeWidth={1} />
                            <span>
                              {new Date(design.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-20 sm:p-28 lg:p-32 text-center border border-[#E8E8E8] bg-white rounded-none">
                <div className="max-w-md mx-auto">
                  <div className="w-28 h-28 mx-auto mb-10 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center rounded-none">
                    <Sparkles className="w-12 h-12 text-[#8B7355]" strokeWidth={1} />
                  </div>
                  <h3 className="font-serif text-4xl font-light text-[#1A1A1A] mb-5 tracking-[-0.01em]">
                    Create Your First Design
                  </h3>
                  <p className="text-base text-[#6B6B6B] mb-10 leading-relaxed font-light tracking-wide">
                    Use AI to generate stunning nail art designs and showcase your creativity
                  </p>
                  <Button
                    onClick={() => router.push("/capture")}
                    className="h-14 px-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 text-[11px] tracking-[0.25em] uppercase font-light hover:scale-[1.02] active:scale-[0.98] rounded-none"
                  >
                    <Plus className="w-5 h-5 mr-2" strokeWidth={1} />
                    Create Design
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8 sm:space-y-10">
            {portfolioImages.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A] mb-2 tracking-[-0.01em]">
                      Portfolio
                    </h2>
                    <p className="text-sm text-[#6B6B6B] font-light tracking-wide">
                      {portfolioImages.length} {portfolioImages.length === 1 ? 'photo' : 'photos'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push("/tech/profile-setup")}
                    className="h-12 px-6 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 text-[11px] tracking-[0.25em] uppercase font-light rounded-none bg-white text-[#1A1A1A]"
                  >
                    <Plus className="w-4 h-4 mr-2" strokeWidth={1} />
                    <span className="hidden sm:inline">Add More</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
                  {portfolioImages.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden bg-gradient-to-br from-[#F8F7F5] to-white border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-2xl hover:shadow-[#8B7355]/5 transition-all duration-700 cursor-pointer rounded-none"
                    >
                      <Image
                        src={url}
                        alt={`Portfolio image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-20 sm:p-28 lg:p-32 text-center border border-[#E8E8E8] bg-white rounded-none">
                <div className="max-w-md mx-auto">
                  <div className="w-28 h-28 mx-auto mb-10 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center rounded-none">
                    <svg className="w-12 h-12 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-4xl font-light text-[#1A1A1A] mb-5 tracking-[-0.01em]">
                    Build Your Portfolio
                  </h3>
                  <p className="text-base text-[#6B6B6B] mb-10 leading-relaxed font-light tracking-wide">
                    Showcase your best nail art work to attract more clients and grow your business
                  </p>
                  <Button
                    onClick={() => router.push("/tech/profile-setup")}
                    className="h-14 px-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 text-[11px] tracking-[0.25em] uppercase font-light hover:scale-[1.02] active:scale-[0.98] rounded-none"
                  >
                    <Plus className="w-5 h-5 mr-2" strokeWidth={1} />
                    Add Photos
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav onCenterAction={() => router.push("/capture")} centerActionLabel="Create" />
      
      {/* Customer Service Chatbot */}
      <CustomerServiceChatbot position="app" />
    </div>
  )
}
