'use client';

interface ContentTypeTagProps {
  type: string;
}

export default function ContentTypeTag({ type }: ContentTypeTagProps) {
  // Define colors for different content types
  const getTagStyle = () => {
    switch (type.toLowerCase()) {
      case 'educational':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'entertainment':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'behind the scenes':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'product showcase':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'trending':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'user generated':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'testimonial':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get icon for content type
  const getTypeIcon = () => {
    switch (type.toLowerCase()) {
      case 'educational':
        return '📚';
      case 'entertainment':
        return '🎭';
      case 'behind the scenes':
        return '🎬';
      case 'product showcase':
        return '✨';
      case 'trending':
        return '🔥';
      case 'user generated':
        return '👥';
      case 'testimonial':
        return '💬';
      default:
        return '📝';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${getTagStyle()}`}>
      <span className="mr-1">{getTypeIcon()}</span>
      {type}
    </span>
  );
} 