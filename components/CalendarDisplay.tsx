'use client';

import { useState, useRef } from 'react';
import { Download, Copy, Check, Calendar, Share2, RefreshCw, Dices } from 'lucide-react';
import toast from 'react-hot-toast';
import { Post } from '@/types';
import ContentTypeTag from './ContentTypeTag';
import SharePreview from './SharePreview';

interface CalendarDisplayProps {
  posts: Post[];
  onPostUpdate?: (updatedPost: Post) => void;
  onRegenerateWeek?: (weekIndex: number, weekPosts: Post[]) => Promise<boolean>;
  onRegeneratePost?: (postToRegenerate: Post) => Promise<boolean>;
  brandInfo?: {
    brandDescription: string;
    tone: string;
    frequency: number;
    userType: string;
  };
}

export default function CalendarDisplay({ 
  posts, 
  onPostUpdate,
  onRegenerateWeek,
  onRegeneratePost,
  brandInfo
}: CalendarDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [editingField, setEditingField] = useState<{postId: string, field: string} | null>(null);
  const [isRegeneratingPost, setIsRegeneratingPost] = useState<string | null>(null);
  const [isRegeneratingWeek, setIsRegeneratingWeek] = useState<number | null>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  if (!posts || posts.length === 0) {
    return null;
  }
  
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
  
  const copyPostToClipboard = (post: Post, index: number) => {
    const text = `
Date: ${new Date(post.date).toLocaleDateString()}
Video Idea: ${post.videoIdea}
Hook: ${post.hook}
Caption: ${post.caption}
Hashtags: ${post.hashtags.join(' ')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Post copied to clipboard!');
    
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };
  
  const copyAllToClipboard = () => {
    const text = posts.map((post) => `
Date: ${new Date(post.date).toLocaleDateString()}
Video Idea: ${post.videoIdea}
Hook: ${post.hook}
Caption: ${post.caption}
Hashtags: ${post.hashtags.join(' ')}
    `.trim()).join('\n\n---\n\n');
    
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    toast.success('All posts copied to clipboard!');
    
    setTimeout(() => {
      setAllCopied(false);
    }, 2000);
  };

  const copyAsNotion = () => {
    const text = posts.map((post) => `
### ${new Date(post.date).toLocaleDateString()}

**Video Idea:** ${post.videoIdea}

**Hook:** ${post.hook}

**Caption:** ${post.caption}

**Hashtags:** ${post.hashtags.join(' ')}

**Content Type:** ${post.contentType || 'General'}
    `.trim()).join('\n\n---\n\n');
    
    navigator.clipboard.writeText(text);
    toast.success('Copied as Notion-compatible markdown!');
  };
  
  const downloadCSV = () => {
    const headers = ['Date', 'Video Idea', 'Hook', 'Caption', 'Hashtags', 'Content Type'];
    const csvContent = [
      headers.join(','),
      ...posts.map((post) => [
        post.date,
        `"${post.videoIdea.replace(/"/g, '""')}"`,
        `"${post.hook.replace(/"/g, '""')}"`,
        `"${post.caption.replace(/"/g, '""')}"`,
        `"${post.hashtags.join(' ').replace(/"/g, '""')}"`,
        `"${post.contentType || 'General'}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tiktok_content_calendar.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Calendar downloaded as CSV!');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEditField = (post: Post, field: string) => {
    if (!onPostUpdate) return;
    setEditingField({ postId: post.id || '', field });
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 50);
  };

  const handleSaveEdit = (post: Post, field: string, value: string) => {
    if (!onPostUpdate) return;
    
    const updatedPost = { ...post };
    
    if (field === 'hashtags') {
      // Convert string of hashtags to array
      updatedPost.hashtags = value
        .split(' ')
        .filter(tag => tag.trim() !== '')
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    } else {
      // @ts-ignore - dynamically setting property
      updatedPost[field] = value;
    }
    
    onPostUpdate(updatedPost);
    setEditingField(null);
  };

  const handleRegeneratePost = async (post: Post) => {
    if (!onRegeneratePost) return;
    
    setIsRegeneratingPost(post.id || null);
    try {
      await onRegeneratePost(post);
      toast.success('Post regenerated!');
    } catch (error) {
      toast.error('Failed to regenerate post');
    } finally {
      setIsRegeneratingPost(null);
    }
  };

  const handleRegenerateWeek = async (weekIndex: number) => {
    if (!onRegenerateWeek) return;
    
    setIsRegeneratingWeek(weekIndex);
    try {
      await onRegenerateWeek(weekIndex, postsByWeek[weekIndex]);
      toast.success(`Week ${weekIndex + 1} regenerated!`);
    } catch (error) {
      toast.error('Failed to regenerate week');
    } finally {
      setIsRegeneratingWeek(null);
    }
  };
  
  return (
    <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">Your TikTok Calendar</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSharePreview(true)}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </button>
          <button
            onClick={copyAllToClipboard}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            {allCopied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy All
              </>
            )}
          </button>
          <button
            onClick={copyAsNotion}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            <Copy className="w-4 h-4 mr-1" />
            Notion
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="border-b border-gray-200 mb-4">
        <div className="flex space-x-1 overflow-x-auto">
          {postsByWeek.map((weekPosts, weekIndex) => (
            <button
              key={weekIndex}
              onClick={() => setActiveTab(weekIndex)}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                activeTab === weekIndex
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Week {weekIndex + 1}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        {postsByWeek.map((weekPosts, weekIndex) => (
          <div 
            key={weekIndex} 
            className={`space-y-4 ${activeTab === weekIndex ? 'block' : 'hidden'}`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-700">Week {weekIndex + 1}</h3>
              {onRegenerateWeek && (
                <button
                  onClick={() => handleRegenerateWeek(weekIndex)}
                  disabled={isRegeneratingWeek === weekIndex}
                  className="flex items-center px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200"
                >
                  {isRegeneratingWeek === weekIndex ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-1" />
                  )}
                  Regenerate Week
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weekPosts.map((post, postIndex) => {
                const globalIndex = weekIndex * 7 + postIndex;
                return (
                  <div 
                    key={post.id || postIndex} 
                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                        {formatDate(post.date)}
                      </span>
                      <div className="flex space-x-1">
                        {onRegeneratePost && (
                          <button
                            onClick={() => handleRegeneratePost(post)}
                            disabled={isRegeneratingPost === post.id}
                            className="text-gray-400 hover:text-purple-500 transition-colors duration-200"
                            title="Remix this post"
                          >
                            {isRegeneratingPost === post.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Dices className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => copyPostToClipboard(post, globalIndex)}
                          className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                        >
                          {copiedIndex === globalIndex ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {post.contentType && (
                      <div className="mt-2">
                        <ContentTypeTag type={post.contentType} />
                      </div>
                    )}
                    
                    <div 
                      className="font-medium text-gray-800 mt-3 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                      onClick={() => onPostUpdate && handleEditField(post, 'videoIdea')}
                    >
                      {editingField?.postId === post.id && editingField?.field === 'videoIdea' ? (
                        <input
                          ref={editInputRef as React.RefObject<HTMLInputElement>}
                          type="text"
                          defaultValue={post.videoIdea}
                          className="w-full p-1 border border-blue-300 rounded text-sm"
                          onBlur={(e) => handleSaveEdit(post, 'videoIdea', e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(post, 'videoIdea', e.currentTarget.value)}
                        />
                      ) : (
                        post.videoIdea
                      )}
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="bg-gray-50 p-2 rounded-md">
                        <span className="font-medium text-gray-700 block mb-1">Hook:</span>
                        <p 
                          className="text-gray-600 italic cursor-pointer hover:text-blue-600"
                          onClick={() => onPostUpdate && handleEditField(post, 'hook')}
                        >
                          {editingField?.postId === post.id && editingField?.field === 'hook' ? (
                            <textarea
                              ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
                              defaultValue={post.hook}
                              className="w-full p-1 border border-blue-300 rounded text-sm"
                              rows={2}
                              onBlur={(e) => handleSaveEdit(post, 'hook', e.target.value)}
                            />
                          ) : (
                            post.hook
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">Caption:</span>
                        <p 
                          className="text-gray-600 line-clamp-2 cursor-pointer hover:text-blue-600"
                          onClick={() => onPostUpdate && handleEditField(post, 'caption')}
                        >
                          {editingField?.postId === post.id && editingField?.field === 'caption' ? (
                            <textarea
                              ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
                              defaultValue={post.caption}
                              className="w-full p-1 border border-blue-300 rounded text-sm"
                              rows={3}
                              onBlur={(e) => handleSaveEdit(post, 'caption', e.target.value)}
                            />
                          ) : (
                            post.caption
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">Hashtags:</span>
                        <div 
                          className="flex flex-wrap gap-1 mt-1 cursor-pointer"
                          onClick={() => onPostUpdate && handleEditField(post, 'hashtags')}
                        >
                          {editingField?.postId === post.id && editingField?.field === 'hashtags' ? (
                            <input
                              ref={editInputRef as React.RefObject<HTMLInputElement>}
                              type="text"
                              defaultValue={post.hashtags.join(' ')}
                              className="w-full p-1 border border-blue-300 rounded text-sm"
                              onBlur={(e) => handleSaveEdit(post, 'hashtags', e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(post, 'hashtags', e.currentTarget.value)}
                            />
                          ) : (
                            <>
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
                                  +{post.hashtags.length - 3} more
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showSharePreview && (
        <SharePreview 
          posts={posts} 
          onClose={() => setShowSharePreview(false)} 
          brandInfo={brandInfo}
        />
      )}
    </div>
  );
} 