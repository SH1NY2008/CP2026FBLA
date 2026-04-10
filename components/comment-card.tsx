import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/star-rating';

interface CommentCardProps {
  author: string;
  text: string;
  rating: number;
  avatarUrl?: string;
}

export function CommentCard({ author, text, rating, avatarUrl }: CommentCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 border-b border-border">
      <Avatar>
        <AvatarImage src={avatarUrl} alt={author} />
        <AvatarFallback>{author.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{author}</p>
          <StarRating rating={rating} />
        </div>
        <p className="text-muted-foreground mt-1">{text}</p>
      </div>
    </div>
  );
}
