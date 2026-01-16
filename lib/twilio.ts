import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

// Create Twilio client (lazy initialization)
let twilioClient: twilio.Twilio | null = null;

function getClient(): twilio.Twilio {
  if (!twilioClient) {
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

// Generate a 6-digit OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format phone number to E.164 format
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1 and is 11 digits, it's a US number
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If it's 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it already has a country code (starts with +), return as is
  if (phone.startsWith('+')) {
    return `+${digits}`;
  }
  
  // Default: add + prefix
  return `+${digits}`;
}

// Validate phone number format
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // E.164 format: + followed by 10-15 digits
  return /^\+[1-9]\d{9,14}$/.test(formatted);
}

// Send OTP via Twilio Verify Service (recommended)
export async function sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getClient();
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!isValidPhoneNumber(formattedPhone)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    // Use Twilio Verify Service if configured
    if (verifyServiceSid) {
      await client.verify.v2
        .services(verifyServiceSid)
        .verifications.create({
          to: formattedPhone,
          channel: 'sms',
        });
      
      return { success: true };
    }

    // Fallback: Send SMS directly with custom OTP
    const otp = generateOTP();
    
    await client.messages.create({
      body: `Your Ivory's Choice verification code is: ${otp}. This code expires in 10 minutes.`,
      to: formattedPhone,
      ...(messagingServiceSid 
        ? { messagingServiceSid } 
        : { from: process.env.TWILIO_PHONE_NUMBER }),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Twilio send verification error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send verification code' 
    };
  }
}

// Verify OTP code using Twilio Verify Service
export async function verifyCode(
  phoneNumber: string, 
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getClient();
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!verifyServiceSid) {
      // If not using Verify Service, verification is handled by the API route
      return { success: false, error: 'Verify service not configured' };
    }

    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: formattedPhone,
        code,
      });

    if (verification.status === 'approved') {
      return { success: true };
    }

    return { success: false, error: 'Invalid verification code' };
  } catch (error: any) {
    console.error('Twilio verify error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to verify code' 
    };
  }
}

// Send a custom SMS message
export async function sendSMS(
  phoneNumber: string, 
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getClient();
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!isValidPhoneNumber(formattedPhone)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    const result = await client.messages.create({
      body: message,
      to: formattedPhone,
      ...(messagingServiceSid 
        ? { messagingServiceSid } 
        : { from: process.env.TWILIO_PHONE_NUMBER }),
    });

    return { success: true, messageId: result.sid };
  } catch (error: any) {
    console.error('Twilio SMS error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send SMS' 
    };
  }
}
