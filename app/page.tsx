'use client';

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import CalendarForm from '@/components/CalendarForm';
import CalendarDisplay from '@/components/CalendarDisplay';
import { Post } from '@/types';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleCalendarGenerated = (generatedPosts: Post[]) => {
    setPosts(generatedPosts);
    setShowCalendar(true);
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
            <CalendarForm onCalendarGenerated={handleCalendarGenerated} />
          </div>
          
          {showCalendar && posts.length > 0 && (
            <div className={`md:col-span-3 transition-all duration-300 ease-in-out`}>
              <CalendarDisplay posts={posts} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
