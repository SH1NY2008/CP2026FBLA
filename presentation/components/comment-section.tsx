'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase';
import { COLLECTIONS } from '@/lib/firestore/schema';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentCard } from '@/components/comment-card';
import { MessageSquare, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { validateCommentBody } from '@/lib/validation';

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

interface CommentSectionProps {
  placeId: string;
}

export function CommentSection({ placeId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Real-time listener
  useEffect(() => {
    if (!placeId) return;

    const q = query(collection(db, COLLECTIONS.comments), where('placeId', '==', placeId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all: Comment[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        all.push({
          id: d.id,
          author: data.author ?? 'Anonymous',
          authorId: data.authorId ?? '',
          text: data.text ?? '',
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
          avatarUrl: data.avatarUrl ?? '',
          parentId: data.parentId ?? null,
          likes: data.likes ?? 0,
          dislikes: data.dislikes ?? 0,
        });
      });

      // Nest replies under parents
      const map = new Map<string, Comment>();
      all.forEach(c => map.set(c.id, { ...c, replies: [] }));

      const roots: Comment[] = [];
      map.forEach(c => {
        if (c.parentId && map.has(c.parentId)) {
          map.get(c.parentId)!.replies!.push(c);
        } else if (!c.parentId) {
          roots.push(c);
        }
      });

      // Sort root comments newest first; replies oldest first
      roots.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      roots.forEach(c => c.replies?.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));

      setComments(roots);
      setLoading(false);
    }, (err) => {
      console.error('Comments error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [placeId]);

  const handlePost = async () => {
    if (!user || !newComment.trim()) return;
    const err = validateCommentBody(newComment);
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, COLLECTIONS.comments), {
        placeId,
        author: user.displayName || 'Anonymous',
        authorId: user.uid,
        text: newComment.trim(),
        timestamp: serverTimestamp(),
        avatarUrl: user.photoURL || '',
        parentId: null,
        likes: 0,
        dislikes: 0,
      });
      setNewComment('');
      setFocused(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!user || !replyText.trim()) return;
    const err = validateCommentBody(replyText);
    if (err) {
      toast.error(err);
      return;
    }
    setReplySubmitting(true);
    try {
      await addDoc(collection(db, COLLECTIONS.comments), {
        placeId,
        author: user.displayName || 'Anonymous',
        authorId: user.uid,
        text: replyText.trim(),
        timestamp: serverTimestamp(),
        avatarUrl: user.photoURL || '',
        parentId,
        likes: 0,
        dislikes: 0,
      });
      setReplyText('');
      setReplyingTo(null);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleReply = (id: string) => {
    if (replyingTo === id) {
      setReplyingTo(null);
    } else {
      setReplyingTo(id);
      setReplyText('');
    }
  };

  const handleLike = async (id: string) => {
    await updateDoc(doc(db, COLLECTIONS.comments, id), { likes: increment(1) });
  };

  const handleDislike = async (id: string) => {
    await updateDoc(doc(db, COLLECTIONS.comments, id), { dislikes: increment(1) });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.comments, id));
    const repliesSnap = await getDocs(query(collection(db, COLLECTIONS.comments), where('parentId', '==', id)));
    repliesSnap.forEach(async (r) => deleteDoc(doc(db, COLLECTIONS.comments, r.id)));
  };

  const totalCount = comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">
          {totalCount > 0 ? `${totalCount.toLocaleString()} Comments` : 'Comments'}
        </h2>
      </div>

      {/* Compose box */}
      {user ? (
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0 mt-0.5">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback className="text-xs font-semibold">
              {user.displayName?.charAt(0)?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Add a comment…"
              rows={focused ? 3 : 1}
              className="resize-none text-sm transition-all"
            />
            {focused && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFocused(false); setNewComment(''); }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handlePost}
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? 'Posting…' : 'Comment'}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border bg-muted/30">
          <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            <Link href="/login" className="text-accent hover:underline font-medium">Sign in</Link>
            {' '}to join the conversation.
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">No comments yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onDislike={handleDislike}
              onReply={handleReply}
              onDelete={handleDelete}
              replyingToId={replyingTo}
              replyForm={
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author}…`}
                      rows={2}
                      className="resize-none text-sm"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={!replyText.trim() || replySubmitting}
                      >
                        {replySubmitting ? 'Posting…' : 'Reply'}
                      </Button>
                    </div>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
