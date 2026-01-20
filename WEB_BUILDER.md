# Web Builder Implementation Guide

## Overview
The Web Builder is a feature that allows nail technicians to create and customize their own professional booking website. It leverages AI to help users design their site through natural language conversation.

## Architecture

### Frontend
- **Page**: `app/tech/website/page.tsx`
  - Main container for the builder interface.
  - Manages state for website data, sections, and chat history.
  - Handles three main tabs: Sections, AI Chat, and Settings.
- **Renderer**: `components/website-builder/website-renderer.tsx`
  - Renders the website preview based on configuration.
  - Dynamically loads section components based on `sectionType`.
  - Applies theme variables (colors, fonts).
- **Sections**: `components/website-builder/sections/`
  - `HeroSection`: Main introduction with background image.
  - `AboutSection`: Tech bio and details.
  - `ServicesSection`: List of offered services.
  - `GallerySection`: Portfolio images grid.
  - `ReviewsSection`: Client reviews carousel/grid.
  - `AvailabilitySection`: Weekly schedule display.
  - `BookingSection`: Integration with booking system.
  - `ContactSection`: Contact info and map.
  - `SocialSection`: Social media links.
  - `WebsiteFooter`: Footer with links and copyright.

### Backend
- **Main API**: `app/api/tech/website/route.ts`
  - `GET`: Fetches website configuration, sections, and related tech data (profile, services, reviews, etc.).
  - `POST`: Creates or updates website configuration (theme, subdomain, published status) and sections.
  - `DELETE`: Deletes the website.
- **AI Chat API**: `app/api/tech/website/chat/route.ts`
  - `POST`: Processes user messages using OpenAI (GPT-4o).
  - Interprets natural language requests to modify theme and section visibility/order.
  - Returns a friendly reply and a JSON object of changes applied.
  - `GET`: Fetches chat history.
- **Subdomain Check**: `app/api/tech/website/check-subdomain/route.ts` (Implied from frontend usage)
  - Checks if a requested subdomain is available.

## Features

### 1. AI-Powered Customization
- Users can chat with an AI assistant to make changes.
- Capabilities:
  - Change color themes (primary, secondary, accent).
  - Change font families.
  - Show/hide sections.
  - Reorder sections (supported by data model, actionable via AI).
- Context-aware: The AI knows the current state of the website.

### 2. Manual Controls
- **Sections Tab**: Toggle visibility of each section.
- **Settings Tab**:
  - **Subdomain**: Choose a unique subdomain (e.g., `nailsbyjess.ivoryschoice.com`).
  - **Publication**: Publish/Unpublish the site.
  - **Colors**: Manually pick Primary, Secondary, and Accent colors.
  - **Fonts**: Select from curated font options (Inter, Playfair Display, Montserrat, Lora, Poppins).

### 3. Data Integration
The website automatically pulls data from the tech's profile:
- Business Name & Bio
- Services & Pricing
- Portfolio Images
- Client Reviews
- Availability Schedule
- Contact Information

## Data Model

### `tech_websites` Table
- `id`: PK
- `tech_profile_id`: FK to tech profile
- `subdomain`: Unique string
- `primary_color`, `secondary_color`, `accent_color`: Hex codes
- `font_family`: Font name
- `is_published`: Boolean
- `seo_title`, `seo_description`: Metadata
- `created_at`, `updated_at`

### `website_sections` Table
- `id`: PK
- `website_id`: FK to website
- `section_type`: Enum (hero, about, services, etc.)
- `display_order`: Integer
- `is_visible`: Boolean
- `settings`: JSON (custom settings per section)
- `title`, `subtitle`, `content`: Overrides for default content
- `background_image`, `background_color`: Visual customization

### `website_chat_history` Table
- `id`: PK
- `website_id`: FK
- `role`: user/assistant
- `content`: Message text
- `changes_made`: JSON (record of changes applied by AI)
- `created_at`

## Implementation Status
- ✅ Frontend Builder Interface
- ✅ Website Renderer & Sections
- ✅ Backend CRUD APIs
- ✅ AI Chat Integration
- ✅ Database Schema
- ✅ Subdomain Management

## Usage
1. Navigate to `/tech/website`.
2. Use the **Settings** tab to claim a subdomain.
3. Use **AI Chat** to "Make it look elegant" or "Hide the blog section".
4. Use **Sections** to manually toggle visibility.
5. Click **Save Changes** to persist updates.
6. Toggle **Published** to make the site live.
