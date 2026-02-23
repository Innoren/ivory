"use client"

import { Instagram, ExternalLink } from "lucide-react"

interface WebsiteFooterProps {
  techProfile: any
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }
}

export function WebsiteFooter({
  techProfile,
  theme,
}: WebsiteFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer 
      className="py-12 border-t"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: `${theme.primaryColor}10`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Business Info */}
          <div className="text-center sm:text-left">
            <p 
              className="text-lg font-light mb-1"
              style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
            >
              {techProfile.businessName || 'Nail Studio'}
            </p>
            {techProfile.location && (
              <p 
                className="text-sm font-light"
                style={{ color: theme.primaryColor, opacity: 0.6 }}
              >
                {techProfile.location}
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {techProfile.instagramHandle && (
              <a
                href={`https://instagram.com/${techProfile.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: theme.accentColor }}
              >
                <Instagram 
                  className="w-5 h-5" 
                  strokeWidth={1.5}
                  style={{ color: theme.primaryColor }}
                />
              </a>
            )}
            {techProfile.website && (
              <a
                href={techProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: theme.accentColor }}
              >
                <ExternalLink 
                  className="w-5 h-5" 
                  strokeWidth={1.5}
                  style={{ color: theme.primaryColor }}
                />
              </a>
            )}
          </div>
        </div>

        {/* Copyright & Powered By */}
        <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: `${theme.primaryColor}10` }}>
          <p 
            className="text-xs font-light mb-2"
            style={{ color: theme.primaryColor, opacity: 0.5 }}
          >
            © {currentYear} {techProfile.businessName || 'Nail Studio'}. All rights reserved.
          </p>
          <p 
            className="text-xs font-light"
            style={{ color: theme.primaryColor, opacity: 0.4 }}
          >
            Powered by{' '}
            <a 
              href="https://ivoryschoice.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: theme.secondaryColor }}
            >
              Ivory's Choice
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
