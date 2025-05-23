import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Post } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { weekPosts, brandDescription, tone, frequency, temperature = 0.7 } = await req.json();

        if (!weekPosts || !brandDescription || !tone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Extract dates from the week posts
        const dates = weekPosts.map((post: Post) => post.date);
        const contentTypes = weekPosts.map((post: Post) => post.contentType || 'General');
        const ids = weekPosts.map((post: Post) => post.id);

        const prompt = `
      Regenerate a week of TikTok posts for the following brand:
      
      Brand Description: ${brandDescription}
      Tone: ${tone}
      
      Create ${weekPosts.length} new posts with fresh ideas, hooks, captions, and hashtags.
      Use the following dates and content types:
      ${dates.map((date: string, i: number) => `${i + 1}. Date: ${date}, Content Type: ${contentTypes[i]}`).join('\n')}
      
      Format the response as a JSON object with the following structure:
      {
        "posts": [
          {
            "date": "${dates[0]}",
            "videoIdea": "New video idea",
            "hook": "New hook",
            "caption": "New caption",
            "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
            "contentType": "${contentTypes[0]}"
          },
          ...
        ]
      }
      
      IMPORTANT: Return ONLY the JSON object with no additional text or explanations.
      Make sure to create exactly ${weekPosts.length} posts, one for each date provided.
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a social media content strategist specialized in creating engaging TikTok content. You always respond with valid JSON."
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
                { error: 'Failed to regenerate week' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        const regeneratedData = JSON.parse(responseContent);

        // Preserve the original IDs
        const regeneratedPosts = regeneratedData.posts.map((post: Post, index: number) => ({
            ...post,
            id: ids[index]
        }));

        return NextResponse.json({ posts: regeneratedPosts });
    } catch (error) {
        console.error('Error regenerating week:', error);
        return NextResponse.json(
            { error: 'Failed to regenerate week' },
            { status: 500 }
        );
    }
} 