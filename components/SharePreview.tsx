'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Post } from '@/types';
import ContentTypeTag from './ContentTypeTag';

interface SharePreviewProps {
  posts: Post[];
  onClose: () => void;
  brandInfo?: {
    brandDescription: string;
    tone: string;
    frequency: number;
    userType: string;
  };
}

export default function SharePreview({ posts, onClose, brandInfo }: SharePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);
  
  // Group posts by week
  const postsByWeek: Post[][] = [];
  let currentWeek: Post[] = [];
  let currentWeekNumber = 0;
  
  posts.forEach((post) => {
    const postDate = new Date(post.date);
    const weekNumber = Math.floor((postDate.getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekNumber !== currentWeekNumber && currentWeek.length > 0) {
      postsByWeek.push(currentWeek);
      currentWeek = [];
      currentWeekNumber = weekNumber;
    }
    
    currentWeek.push(post);
  });
  
  if (currentWeek.length > 0) {
    postsByWeek.push(currentWeek);
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleCopyLink = () => {
    // In a real app, this would generate a shareable link
    // For now, we'll just simulate copying a link
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Public Preview</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow p-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">TikTok Content Calendar</h1>
              {brandInfo?.userType && (
                <div className="mb-2 text-gray-600">{brandInfo.userType}</div>
              )}
              {brandInfo?.tone && (
                <div className="mb-4 inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {brandInfo.tone} Tone
                </div>
              )}
            </div>
            
            <div className="flex mb-6 border-b border-gray-200">
              {postsByWeek.map((_, weekIndex) => (
                <button
                  key={weekIndex}
                  onClick={() => setActiveWeek(weekIndex)}
                  className={`py-2 px-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeWeek === weekIndex
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Week {weekIndex + 1}
                </button>
              ))}
            </div>
            
            {postsByWeek.map((weekPosts, weekIndex) => (
              <div 
                key={weekIndex}
                className={`space-y-4 ${activeWeek === weekIndex ? 'block' : 'hidden'}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weekPosts.map((post, postIndex) => (
                    <div 
                      key={post.id || postIndex}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                          {formatDate(post.date)}
                        </span>
                        {post.contentType && <ContentTypeTag type={post.contentType} />}
                      </div>
                      
                      <h3 className="font-medium text-gray-800 mb-2">
                        {post.videoIdea}
                      </h3>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Hook:</span>
                          <p className="text-gray-600 italic">{post.hook}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Caption:</span>
                          <p className="text-gray-600 line-clamp-2">{post.caption}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Hashtags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.hashtags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))}
                            {post.hashtags.length > 3 && (
                              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{post.hashtags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Generated with TikTok Content Calendar Generator
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 