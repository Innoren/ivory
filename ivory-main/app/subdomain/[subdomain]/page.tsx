"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { WebsiteRenderer } from "@/components/website-builder/website-renderer"

export default function SubdomainPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await fetch(`/api/website/${subdomain}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Website not found")
        }
        const websiteData = await response.json()
        setData(websiteData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (subdomain) {
      fetchWebsite()
    }
  }, [subdomain])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-[#1A1A1A] mb-2">Website Not Found</h1>
          <p className="text-[#6B6B6B]">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <WebsiteRenderer
      website={data.website}
      sections={data.sections}
      techProfile={data.techProfile}
      user={data.user}
      services={data.services}
      portfolioImages={data.portfolioImages}
      reviews={data.reviews}
      availability={data.availability}
      subdomain={subdomain}
    />
  )
}
