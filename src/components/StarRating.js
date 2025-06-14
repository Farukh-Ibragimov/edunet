import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, reviews, showReviews = true, size = 'w-4 h-4' }) => {
  // Ensure rating is a number and clamp it between 0 and 5
  const numericRating = Math.max(0, Math.min(5, parseFloat(rating) || 0));
  
  // Calculate how many full stars, half stars, and empty stars
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, index) => (
        <Star 
          key={`full-${index}`} 
          className={`${size} text-yellow-400 fill-current`} 
        />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative inline-block">
          <Star className={`${size} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${size} text-yellow-400 fill-current`} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <Star 
          key={`empty-${index}`} 
          className={`${size} text-gray-300`} 
        />
      ))}
      
      {/* Rating text and reviews */}
      <span className="text-sm font-medium ml-1">{numericRating.toFixed(1)}</span>
      {showReviews && reviews !== undefined && reviews !== null && (
        <span className="text-xs text-gray-500 ml-1">({reviews} reviews)</span>
      )}
    </div>
  );
};

export default StarRating; 