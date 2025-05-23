import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Post } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { post, brandDescription, tone, temperature = 0.7 } = await req.json();

        if (!post || !brandDescription || !tone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = `
      Regenerate a single TikTok post for the following brand:
      
      Brand Description: ${brandDescription}
      Tone: ${tone}
      
      The current post is:
      Date: ${post.date}
      Video Idea: ${post.videoIdea}
      Hook: ${post.hook}
      Caption: ${post.caption}
      Hashtags: ${post.hashtags.join(' ')}
      Content Type: ${post.contentType || 'General'}
      
      Create a new version of this post with the same content type but a fresh approach.
      Keep the same date but create new video idea, hook, caption, and hashtags.
      
      Format the response as a JSON object with the following structure:
      {
        "date": "${post.date}",
        "videoIdea": "New video idea",
        "hook": "New hook",
        "caption": "New caption",
        "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
        "contentType": "${post.contentType || 'General'}"
      }
      
      IMPORTANT: Return ONLY the JSON object with no additional text or explanations.
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
                { error: 'Failed to regenerate post' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        const regeneratedPost = JSON.parse(responseContent) as Post;

        // Preserve the original ID
        regeneratedPost.id = post.id;

        return NextResponse.json({ post: regeneratedPost });
    } catch (error) {
        console.error('Error regenerating post:', error);
        return NextResponse.json(
            { error: 'Failed to regenerate post' },
            { status: 500 }
        );
    }
} 