import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star 
          key={i} 
          size={24}
          fill={i < rating ? 'currentColor' : 'none'} 
          className={i < rating ? 'text-yellow-400' : 'text-gray-300'} 
        />
      ))}
    </div>
  );
};

export default StarRating;