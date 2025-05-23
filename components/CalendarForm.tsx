'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';
import { Post } from '@/types';
import UserTypeSelector from './UserTypeSelector';
import ExperimentalControls from './ExperimentalControls';

interface CalendarFormProps {
  onCalendarGenerated: (calendar: Post[], formData: {
    brandDescription: string;
    tone: string;
    frequency: number;
    userType: string;
    temperature?: number;
  }) => void;
  initialValues?: {
    brandDescription: string;
    tone: string;
    frequency: number;
    userType: string;
  };
}

export default function CalendarForm({ 
  onCalendarGenerated, 
  initialValues 
}: CalendarFormProps) {
  const [brandDescription, setBrandDescription] = useState(initialValues?.brandDescription || '');
  const [tone, setTone] = useState(initialValues?.tone || '');
  const [frequency, setFrequency] = useState(initialValues?.frequency?.toString() || '3');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(initialValues?.userType || '');
  const [showExperimentalControls, setShowExperimentalControls] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [showPrompt, setShowPrompt] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Update form when initialValues change
  useEffect(() => {
    if (initialValues) {
      setBrandDescription(initialValues.brandDescription || '');
      setTone(initialValues.tone || '');
      setFrequency(initialValues.frequency?.toString() || '3');
      setUserType(initialValues.userType || '');
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandDescription || !tone || !frequency) {
      toast.error('Please fill all fields');
      return;
    }
    
    setLoading(true);

    // Build the enhanced prompt
    const enhancedDescription = userType 
      ? `${brandDescription}\n\nThis is for a ${userType}.` 
      : brandDescription;
    
    const promptData = {
      brandDescription: enhancedDescription,
      tone,
      frequency: parseInt(frequency),
      temperature
    };

    // For debugging - show the prompt if enabled
    const promptForDisplay = `
Brand Description: ${enhancedDescription}
Tone: ${tone}
Frequency: ${frequency} posts per week
Temperature: ${temperature}
    `.trim();
    
    setGeneratedPrompt(promptForDisplay);
    
    try {
      const response = await fetch('/api/generate-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate calendar');
      }
      
      const data = await response.json();
      onCalendarGenerated(data.posts || [], {
        brandDescription,
        tone,
        frequency: parseInt(frequency),
        userType
      });
      toast.success('Calendar generated successfully!');
    } catch (error) {
      console.error('Error generating calendar:', error);
      toast.error('Failed to generate calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toneOptions = [
    { value: 'Funny', icon: '😂' },
    { value: 'Inspirational', icon: '✨' },
    { value: 'Educational', icon: '📚' },
    { value: 'Bold', icon: '💪' },
    { value: 'Casual', icon: '😎' },
    { value: 'Professional', icon: '👔' },
    { value: 'Quirky', icon: '🤪' },
    { value: 'Serious', icon: '🧐' },
    { value: 'Chill', icon: '😌' },
    { value: 'Trendy', icon: '🔥' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">Create Your Calendar</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowExperimentalControls(!showExperimentalControls)}
          className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <Sliders className="h-3 w-3" />
          {showExperimentalControls ? 'Hide' : 'Advanced'}
        </button>
      </div>

      {showExperimentalControls && (
        <ExperimentalControls 
          temperature={temperature}
          setTemperature={setTemperature}
          showPrompt={showPrompt}
          setShowPrompt={setShowPrompt}
        />
      )}

      <UserTypeSelector userType={userType} setUserType={setUserType} />

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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {toneOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTone(option.value)}
              className={`py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                tone === option.value 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-1">{option.icon}</span> {option.value}
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

      {showPrompt && showExperimentalControls && generatedPrompt && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs font-mono overflow-auto">
          <p className="text-gray-500 mb-1">Generated Prompt:</p>
          <pre className="whitespace-pre-wrap">{generatedPrompt}</pre>
        </div>
      )}
    </form>
  );
} 