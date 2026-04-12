'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  author: string;
  authorId: string;
  text: string;
  timestamp: Date;
  avatarUrl?: string;
  parentId?: string | null;
  likes: number;
  dislikes: number;
  replies?: Comment[];
}

interface CommentCardProps {
  comment: Comment;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  isReply?: boolean;
  replyingToId?: string | null;
  replyForm?: React.ReactNode;
}

export function CommentCard({
  comment,
  onLike,
  onDislike,
  onReply,
  onDelete,
  isReply = false,
  replyingToId,
  replyForm,
}: CommentCardProps) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = user?.uid === comment.authorId;
  const replyCount = comment.replies?.length ?? 0;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(comment.timestamp, { addSuffix: true });
    } catch {
      return '';
    }
  })();

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : ''}`}>
      <Avatar className={isReply ? 'h-7 w-7 shrink-0 mt-0.5' : 'h-9 w-9 shrink-0 mt-0.5'}>
        <AvatarImage src={comment.avatarUrl || ''} alt={comment.author ?? ''} />
        <AvatarFallback className="text-xs font-semibold">
          {comment.author?.charAt(0)?.toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`font-semibold text-foreground ${isReply ? 'text-sm' : 'text-sm'}`}>
            {comment.author || 'Anonymous'}
          </span>
          {timeAgo && (
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          )}
        </div>

        {/* Text */}
        <p className={`mt-1 text-foreground leading-relaxed ${isReply ? 'text-sm' : 'text-sm'}`}>
          {comment.text}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {comment.likes > 0 && <span className="font-medium">{comment.likes}</span>}
          </button>

          <button
            onClick={() => onDislike(comment.id)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            {comment.dislikes > 0 && <span className="font-medium">{comment.dislikes}</span>}
          </button>

          {!isReply && user && (
            <button
              onClick={() => onReply(comment.id)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                replyingToId === comment.id
                  ? 'text-accent bg-accent/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Reply
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Inline reply form */}
        {replyingToId === comment.id && replyForm}

        {/* Replies */}
        {replyCount > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplies(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors py-1"
            >
              {showReplies ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </button>

            {showReplies && (
              <div className="space-y-0">
                {comment.replies!.map(reply => (
                  <CommentCard
                    key={reply.id}
                    comment={reply}
                    onLike={onLike}
                    onDislike={onDislike}
                    onReply={onReply}
                    onDelete={onDelete}
                    isReply
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
