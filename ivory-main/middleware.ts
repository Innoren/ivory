import { NextRequest, NextResponse } from 'next/server';

// Reserved subdomains that should not be treated as tech websites
const RESERVED_SUBDOMAINS = [
  'www', 'app', 'api', 'admin', 'dashboard', 'panel',
  'mail', 'email', 'support', 'help', 'contact',
  'shop', 'store', 'booking', 'book', 'pay', 'payment',
  'auth', 'login', 'signup', 'register', 'account',
  'blog', 'news', 'about', 'careers', 'jobs',
  'dev', 'staging', 'test', 'demo', 'cdn', 'static',
  'legal', 'terms', 'privacy', 'policy'
];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Check if this is a subdomain request on ivoryschoice.com
  if (hostname.includes('ivoryschoice.com')) {
    const parts = hostname.split('.');
    
    // Check if there's a subdomain (e.g., sarah.ivoryschoice.com)
    if (parts.length >= 3 || (parts.length === 2 && !hostname.startsWith('ivoryschoice.com'))) {
      const subdomain = parts[0].toLowerCase();
      
      // Skip reserved subdomains
      if (RESERVED_SUBDOMAINS.includes(subdomain)) {
        return NextResponse.next();
      }
      
      // Skip API routes and static files
      if (url.pathname.startsWith('/api') || 
          url.pathname.startsWith('/_next') || 
          url.pathname.startsWith('/subdomain') ||
          url.pathname.includes('.')) {
        return NextResponse.next();
      }
      
      console.log(`Subdomain request: ${subdomain} -> ${url.pathname}`);
      
      // Rewrite to the subdomain handler
      // Handle both root and nested paths (e.g., /book)
      const newPath = url.pathname === '/' 
        ? `/subdomain/${subdomain}`
        : `/subdomain/${subdomain}${url.pathname}`;
      
      url.pathname = newPath;
      return NextResponse.rewrite(url);
    }
  }
  
  // For local development, check for subdomain in localhost
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Support subdomain testing via query param in development
    const subdomainParam = url.searchParams.get('subdomain');
    if (subdomainParam && !url.pathname.startsWith('/subdomain')) {
      url.pathname = `/subdomain/${subdomainParam}${url.pathname === '/' ? '' : url.pathname}`;
      url.searchParams.delete('subdomain');
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};