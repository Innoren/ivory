"use client"

import { Star } from "lucide-react"

interface ReviewsSectionProps {
  section: any
  techProfile: any
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }
  subdomain: string
  reviews: any[]
}

export function ReviewsSection({
  section,
  techProfile,
  theme,
  reviews,
}: ReviewsSectionProps) {
  const rating = parseFloat(techProfile.rating) || 0
  const totalReviews = techProfile.totalReviews || 0

  if (reviews.length === 0 && totalReviews === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <section 
      className="py-16 sm:py-24 lg:py-32"
      style={{ backgroundColor: theme.accentColor }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p 
            className="text-xs tracking-[0.3em] uppercase mb-4 font-light"
            style={{ color: theme.secondaryColor }}
          >
            Reviews
          </p>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-6"
            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
          >
            What Clients Say
          </h2>

          {/* Overall Rating */}
          <div className="flex items-center justify-center gap-4">
            <span 
              className="text-5xl sm:text-6xl font-light"
              style={{ color: theme.primaryColor }}
            >
              {rating.toFixed(1)}
            </span>
            <div className="text-left">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5"
                    fill={i < Math.round(rating) ? theme.secondaryColor : 'transparent'}
                    stroke={theme.secondaryColor}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p 
                className="text-sm font-light"
                style={{ color: theme.primaryColor, opacity: 0.6 }}
              >
                {totalReviews} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 sm:p-8"
                style={{ borderRadius: '8px' }}
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      fill={i < review.rating ? theme.secondaryColor : 'transparent'}
                      stroke={theme.secondaryColor}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>

                {/* Comment */}
                {review.comment && (
                  <p 
                    className="text-sm font-light leading-relaxed mb-6"
                    style={{ color: theme.primaryColor, opacity: 0.8 }}
                  >
                    "{review.comment}"
                  </p>
                )}

                {/* Client Info */}
                <div className="flex items-center gap-3">
                  {review.client?.avatar ? (
                    <img
                      src={review.client.avatar}
                      alt={review.client.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-light"
                      style={{ backgroundColor: theme.secondaryColor }}
                    >
                      {review.client?.username?.charAt(0).toUpperCase() || 'C'}
                    </div>
                  )}
                  <div>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: theme.primaryColor }}
                    >
                      {review.client?.username || 'Client'}
                    </p>
                    <p 
                      className="text-xs font-light"
                      style={{ color: theme.primaryColor, opacity: 0.5 }}
                    >
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
