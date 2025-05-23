'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import CalendarForm from '@/components/CalendarForm';
import CalendarDisplay from '@/components/CalendarDisplay';
import { Post } from '@/types';
import toast from 'react-hot-toast';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [brandDescription, setBrandDescription] = useState('');
  const [tone, setTone] = useState('');
  const [frequency, setFrequency] = useState(3);
  const [userType, setUserType] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  
  // Load saved calendar from localStorage on initial render
  useEffect(() => {
    const savedCalendar = localStorage.getItem('tikTokCalendar');
    if (savedCalendar) {
      try {
        const { posts: savedPosts, brandDescription: savedBrand, tone: savedTone, frequency: savedFrequency, userType: savedUserType } = JSON.parse(savedCalendar);
        if (savedPosts && savedPosts.length > 0) {
          setPosts(savedPosts);
          setBrandDescription(savedBrand || '');
          setTone(savedTone || '');
          setFrequency(savedFrequency || 3);
          setUserType(savedUserType || '');
          setShowCalendar(true);
        }
      } catch (error) {
        console.error('Error loading saved calendar:', error);
      }
    }
  }, []);
  
  // Save calendar to localStorage whenever it changes
  useEffect(() => {
    if (posts.length > 0) {
      const calendarData = {
        posts,
        brandDescription,
        tone,
        frequency,
        userType
      };
      localStorage.setItem('tikTokCalendar', JSON.stringify(calendarData));
    }
  }, [posts, brandDescription, tone, frequency, userType]);

  const handleCalendarGenerated = (generatedPosts: Post[], formData: { 
    brandDescription: string, 
    tone: string, 
    frequency: number,
    userType: string,
    temperature?: number
  }) => {
    // Add unique IDs to each post
    const postsWithIds = generatedPosts.map(post => ({
      ...post,
      id: uuidv4()
    }));
    
    setPosts(postsWithIds);
    setBrandDescription(formData.brandDescription);
    setTone(formData.tone);
    setFrequency(formData.frequency);
    setUserType(formData.userType);
    if (formData.temperature) setTemperature(formData.temperature);
    setShowCalendar(true);
  };
  
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };
  
  const handleRegenerateWeek = async (weekIndex: number, weekPosts: Post[]) => {
    try {
      const response = await fetch('/api/regenerate-week', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekPosts,
          brandDescription,
          tone,
          frequency,
          temperature
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate week');
      }
      
      const { posts: regeneratedPosts } = await response.json();
      
      // Update the posts array with the regenerated posts
      setPosts(currentPosts => {
        return currentPosts.map(post => {
          const regeneratedPost = regeneratedPosts.find((rp: Post) => rp.id === post.id);
          return regeneratedPost || post;
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error regenerating week:', error);
      toast.error('Failed to regenerate week');
      return false;
    }
  };
  
  const handleRegeneratePost = async (postToRegenerate: Post) => {
    try {
      const response = await fetch('/api/regenerate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post: postToRegenerate,
          brandDescription,
          tone,
          temperature
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate post');
      }
      
      const { post: regeneratedPost } = await response.json();
      
      // Update the posts array with the regenerated post
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.id === regeneratedPost.id ? regeneratedPost : post
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error regenerating post:', error);
      toast.error('Failed to regenerate post');
      return false;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
          },
        }}
      />
      
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
        <header className="text-center mb-12">
          <div className="inline-block mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            <h1 className="text-4xl font-bold mb-2">TikTok Content Calendar</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Create a personalized 4-week content calendar for your TikTok strategy
          </p>
        </header>
        
        <div className="grid md:grid-cols-5 gap-8">
          <div className={`md:col-span-2 ${showCalendar ? 'md:block' : 'md:col-span-5'}`}>
            <CalendarForm 
              onCalendarGenerated={handleCalendarGenerated}
              initialValues={{
                brandDescription,
                tone,
                frequency,
                userType
              }}
            />
          </div>
          
          {showCalendar && posts.length > 0 && (
            <div className={`md:col-span-3 transition-all duration-300 ease-in-out`}>
              <CalendarDisplay 
                posts={posts} 
                onPostUpdate={handlePostUpdate}
                onRegenerateWeek={handleRegenerateWeek}
                onRegeneratePost={handleRegeneratePost}
                brandInfo={{
                  brandDescription,
                  tone,
                  frequency,
                  userType
                }}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
