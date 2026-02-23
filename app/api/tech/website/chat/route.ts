import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techWebsites, websiteSections, websiteChatHistory, techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST - Process AI chat message and update website
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, imageUrl } = body;

    if (!userId || !message) {
      return NextResponse.json({ error: 'User ID and message are required' }, { status: 400 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, parseInt(userId)),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // Get website with sections
    const website = await db.query.techWebsites.findFirst({
      where: eq(techWebsites.techProfileId, techProfile.id),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.displayOrder)],
        },
      },
    });

    if (!website) {
      return NextResponse.json({ error: 'Website not found. Please create a website first.' }, { status: 404 });
    }

    // Build current state for AI context
    const currentState = {
      theme: {
        primaryColor: website.primaryColor,
        secondaryColor: website.secondaryColor,
        accentColor: website.accentColor,
        fontFamily: website.fontFamily,
      },
      sections: website.sections.map(s => ({
        id: s.id,
        type: s.sectionType,
        isVisible: s.isVisible,
        displayOrder: s.displayOrder,
      })),
    };

    // Save user message to chat history
    await db.insert(websiteChatHistory).values({
      websiteId: website.id,
      role: 'user',
      content: message,
      createdAt: new Date(),
    });

    // Build AI prompt
    const systemPrompt = `You are an AI assistant helping customize a nail technician's booking website. 
You can modify the website's theme (colors, fonts) and section visibility/order.

Current website state:
${JSON.stringify(currentState, null, 2)}

Available section types: hero, about, services, gallery, reviews, booking, contact, social, faq, custom

Available fonts: Inter, Playfair Display, Montserrat, Lora, Poppins

When the user asks for changes, respond with a JSON object containing:
1. "reply": A friendly message explaining what you changed
2. "changes": An object with the changes to apply:
   - "theme": { primaryColor?, secondaryColor?, accentColor?, fontFamily? }
   - "sections": [{ id, isVisible?, displayOrder? }]

Example response:
{
  "reply": "I've made your website darker and hidden the reviews section. The new look has a sophisticated feel!",
  "changes": {
    "theme": {
      "primaryColor": "#0A0A0A",
      "secondaryColor": "#6B5B4F"
    },
    "sections": [
      { "id": 5, "isVisible": false }
    ]
  }
}

Only include fields that need to change. Be creative with color suggestions but keep them professional and elegant.
If the user's request is unclear, ask for clarification in your reply and don't include changes.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add image if provided
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: message },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      });
    } else {
      messages.push({ role: 'user', content: message });
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(aiResponse);
    const { reply, changes } = parsed;

    // Apply changes if any
    if (changes) {
      // Update theme
      if (changes.theme) {
        const themeUpdate: any = { updatedAt: new Date() };
        if (changes.theme.primaryColor) themeUpdate.primaryColor = changes.theme.primaryColor;
        if (changes.theme.secondaryColor) themeUpdate.secondaryColor = changes.theme.secondaryColor;
        if (changes.theme.accentColor) themeUpdate.accentColor = changes.theme.accentColor;
        if (changes.theme.fontFamily) themeUpdate.fontFamily = changes.theme.fontFamily;

        await db
          .update(techWebsites)
          .set(themeUpdate)
          .where(eq(techWebsites.id, website.id));
      }

      // Update sections
      if (changes.sections && Array.isArray(changes.sections)) {
        for (const sectionChange of changes.sections) {
          if (sectionChange.id) {
            const sectionUpdate: any = { updatedAt: new Date() };
            if (typeof sectionChange.isVisible === 'boolean') {
              sectionUpdate.isVisible = sectionChange.isVisible;
            }
            if (typeof sectionChange.displayOrder === 'number') {
              sectionUpdate.displayOrder = sectionChange.displayOrder;
            }

            await db
              .update(websiteSections)
              .set(sectionUpdate)
              .where(eq(websiteSections.id, sectionChange.id));
          }
        }
      }
    }

    // Save assistant response to chat history
    await db.insert(websiteChatHistory).values({
      websiteId: website.id,
      role: 'assistant',
      content: reply,
      changesMade: changes || null,
      createdAt: new Date(),
    });

    // Fetch updated website
    const updatedWebsite = await db.query.techWebsites.findFirst({
      where: eq(techWebsites.id, website.id),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.displayOrder)],
        },
      },
    });

    return NextResponse.json({
      reply,
      changes,
      website: updatedWebsite,
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}

// GET - Fetch chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, parseInt(userId)),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // Get website
    const website = await db.query.techWebsites.findFirst({
      where: eq(techWebsites.techProfileId, techProfile.id),
    });

    if (!website) {
      return NextResponse.json({ messages: [] });
    }

    // Get chat history
    const history = await db.query.websiteChatHistory.findMany({
      where: eq(websiteChatHistory.websiteId, website.id),
      orderBy: (chat, { asc }) => [asc(chat.createdAt)],
    });

    return NextResponse.json({ messages: history });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}
