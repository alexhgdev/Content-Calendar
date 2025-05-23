'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Post } from '@/types';

interface CalendarFormProps {
  onCalendarGenerated: (calendar: Post[]) => void;
}

export default function CalendarForm({ onCalendarGenerated }: CalendarFormProps) {
  const [brandDescription, setBrandDescription] = useState('');
  const [tone, setTone] = useState('');
  const [frequency, setFrequency] = useState('3');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandDescription || !tone || !frequency) {
      toast.error('Please fill all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandDescription,
          tone,
          frequency: parseInt(frequency),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate calendar');
      }
      
      const data = await response.json();
      onCalendarGenerated(data.posts || []);
      toast.success('Calendar generated successfully!');
    } catch (error) {
      console.error('Error generating calendar:', error);
      toast.error('Failed to generate calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toneOptions = [
    'Funny', 'Inspirational', 'Educational', 'Bold', 
    'Casual', 'Professional', 'Quirky', 'Serious'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800">Create Your Calendar</h2>
      </div>

      <div className="space-y-2">
        <label htmlFor="brandDescription" className="block text-sm font-medium text-gray-700">
          Brand Description
        </label>
        <textarea
          id="brandDescription"
          value={brandDescription}
          onChange={(e) => setBrandDescription(e.target.value)}
          placeholder="Describe your brand, products, target audience, and goals..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          rows={4}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
          Content Tone
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {toneOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTone(option)}
              className={`py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                tone === option 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {tone && (
          <p className="mt-2 text-sm font-medium text-blue-600">Selected: {tone}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
          Posting Frequency
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
          required
        >
          <option value="1">1 post per week</option>
          <option value="2">2 posts per week</option>
          <option value="3">3 posts per week</option>
          <option value="4">4 posts per week</option>
          <option value="5">5 posts per week</option>
          <option value="6">6 posts per week</option>
          <option value="7">7 posts per week</option>
        </select>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center justify-center shadow-md"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Generating Calendar...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Content Calendar
          </>
        )}
      </button>
    </form>
  );
} 