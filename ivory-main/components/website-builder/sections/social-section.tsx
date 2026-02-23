"use client"

import { Instagram, Facebook, ExternalLink } from "lucide-react"

interface SocialSectionProps {
  section: any
  techProfile: any
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }
  subdomain: string
}

// TikTok icon component
function TikTokIcon({ className, strokeWidth }: { className?: string; strokeWidth?: number }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth || 2}
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

export function SocialSection({
  section,
  techProfile,
  theme,
}: SocialSectionProps) {
  const socialLinks = []

  if (techProfile.instagramHandle) {
    socialLinks.push({
      platform: 'Instagram',
      handle: techProfile.instagramHandle,
      url: `https://instagram.com/${techProfile.instagramHandle.replace('@', '')}`,
      icon: Instagram,
    })
  }

  if (techProfile.tiktokHandle) {
    socialLinks.push({
      platform: 'TikTok',
      handle: techProfile.tiktokHandle,
      url: `https://tiktok.com/@${techProfile.tiktokHandle.replace('@', '')}`,
      icon: TikTokIcon,
    })
  }

  if (techProfile.facebookHandle) {
    socialLinks.push({
      platform: 'Facebook',
      handle: techProfile.facebookHandle,
      url: `https://facebook.com/${techProfile.facebookHandle}`,
      icon: Facebook,
    })
  }

  // Add other social links
  if (techProfile.otherSocialLinks && Array.isArray(techProfile.otherSocialLinks)) {
    techProfile.otherSocialLinks.forEach((link: any) => {
      if (link.platform && (link.handle || link.url)) {
        socialLinks.push({
          platform: link.platform,
          handle: link.handle || link.url,
          url: link.url || `https://${link.platform.toLowerCase()}.com/${link.handle}`,
          icon: ExternalLink,
        })
      }
    })
  }

  if (socialLinks.length === 0) {
    return null
  }

  return (
    <section 
      className="py-16 sm:py-24"
      style={{ backgroundColor: theme.accentColor }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p 
            className="text-xs tracking-[0.3em] uppercase mb-4 font-light"
            style={{ color: theme.secondaryColor }}
          >
            Follow Us
          </p>
          <h2 
            className="text-2xl sm:text-3xl font-light tracking-tight"
            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
          >
            Stay Connected
          </h2>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((social, index) => {
            const Icon = social.icon
            return (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 bg-white transition-all duration-300 hover:shadow-md hover:scale-105"
                style={{ borderRadius: '8px' }}
              >
                <Icon 
                  className="w-5 h-5" 
                  strokeWidth={1.5}
                  style={{ color: theme.secondaryColor }}
                />
                <div>
                  <p 
                    className="text-xs tracking-[0.15em] uppercase font-light"
                    style={{ color: theme.primaryColor, opacity: 0.6 }}
                  >
                    {social.platform}
                  </p>
                  <p 
                    className="text-sm font-light"
                    style={{ color: theme.primaryColor }}
                  >
                    @{social.handle.replace('@', '')}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
