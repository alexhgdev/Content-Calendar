import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CalendarResponse } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { brandDescription, tone, frequency, temperature = 0.7 } = await req.json();

        if (!brandDescription || !tone || !frequency) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get current date for the calendar
        const today = new Date();
        const startDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

        const prompt = `
      Create a 4-week TikTok content calendar for a brand with the following details:
      
      Brand Description: ${brandDescription}
      Tone: ${tone}
      Posting Frequency: ${frequency} times per week
      
      For each post, provide:
      1. Suggested date (starting from today: ${startDate}, and spanning the next 4 weeks)
      2. Video idea (brief description)
      3. Hook (first line spoken)
      4. Caption
      5. Suggested hashtags (5-7 relevant hashtags)
      6. Content type (one of: "Educational", "Entertainment", "Behind the Scenes", "Product Showcase", "Trending", "User Generated", "Testimonial")
      
      Format the response as a JSON object with the following structure:
      {
        "posts": [
          {
            "date": "YYYY-MM-DD",
            "videoIdea": "Brief description",
            "hook": "First line spoken",
            "caption": "Caption text",
            "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
            "contentType": "Content type from the list above"
          },
          ...
        ]
      }
      
      Generate exactly ${frequency * 4} posts total, evenly distributed across the 4 weeks.
      Make sure all dates are accurate starting from ${startDate} and following a realistic posting schedule.
      
      IMPORTANT: Return ONLY the JSON object with no additional text or explanations.
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a social media content strategist specialized in creating engaging TikTok content calendars. You always respond with valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: temperature,
        });

        const responseContent = completion.choices[0].message.content;

        if (!responseContent) {
            return NextResponse.json(
                { error: 'Failed to generate content calendar' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        const calendarData = JSON.parse(responseContent) as CalendarResponse;

        return NextResponse.json(calendarData);
    } catch (error) {
        console.error('Error generating calendar:', error);
        return NextResponse.json(
            { error: 'Failed to generate content calendar' },
            { status: 500 }
        );
    }
} 