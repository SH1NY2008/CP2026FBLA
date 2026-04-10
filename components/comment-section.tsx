
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/firebase"
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, deleteDoc, getDocs } from "firebase/firestore"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommentCard } from "@/components/comment-card"

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
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!placeId) return;

        const q = query(collection(db, "comments"), where("placeId", "==", placeId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const commentsData: Comment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                commentsData.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
                    likes: data.likes || 0,
                    dislikes: data.dislikes || 0,
                } as Comment);
            });

            const nestedComments = commentsData.reduce((acc, comment) => {
                if (comment.parentId) {
                    const parent = commentsData.find(c => c.id === comment.parentId);
                    if (parent) {
                        if (!parent.replies) {
                            parent.replies = [];
                        }
                        parent.replies.push(comment);
                    }
                } else {
                    acc.push(comment);
                }
                return acc;
            }, [] as Comment[]);
            
            nestedComments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            setComments(nestedComments);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching comments:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [placeId]);

    const handleAddComment = async () => {
        if (!user || !newComment.trim()) return;

        await addDoc(collection(db, "comments"), {
            placeId,
            author: user.displayName || "Anonymous",
            authorId: user.uid,
            text: newComment,
            timestamp: serverTimestamp(),
            avatarUrl: user.photoURL || "",
            parentId: null,
            likes: 0,
            dislikes: 0,
        });

        setNewComment("");
    };

    const handleAddReply = async (parentId: string) => {
        if (!user || !replyText.trim()) return;

        await addDoc(collection(db, "comments"), {
            placeId,
            author: user.displayName || "Anonymous",
            authorId: user.uid,
            text: replyText,
            timestamp: serverTimestamp(),
            avatarUrl: user.photoURL || "",
            parentId: parentId,
            likes: 0,
            dislikes: 0,
        });

        setReplyText("");
        setReplyingTo(null);
    }

    const handleLike = async (id: string) => {
        const commentRef = doc(db, "comments", id);
        await updateDoc(commentRef, {
            likes: increment(1)
        });
    }

    const handleDislike = async (id: string) => {
        const commentRef = doc(db, "comments", id);
        await updateDoc(commentRef, {
            dislikes: increment(1)
        });
    }

    const handleReply = (id: string) => {
        setReplyingTo(id);
    }

    const handleDeleteComment = async (id: string) => {
        const commentRef = doc(db, "comments", id);
        await deleteDoc(commentRef);

        const repliesQuery = query(collection(db, "comments"), where("parentId", "==", id));
        const repliesSnapshot = await getDocs(repliesQuery);
        repliesSnapshot.forEach(async (replyDoc) => {
            await deleteDoc(doc(db, "comments", replyDoc.id));
        });
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Comments</h2>
            {user ? (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                         <Avatar>
                            <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                            <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold">{user.displayName || "You"}</p>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            rows={3}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                            Post Comment
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <p className="text-muted-foreground">You must be signed in to comment.</p>
            )}

            {loading ? (
                <p>Loading comments...</p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id}>
                            <CommentCard
                                comment={comment}
                                onLike={handleLike}
                                onDislike={handleDislike}
                                onReply={handleReply}
                                onDelete={handleDeleteComment}
                            />
                            {replyingTo === comment.id && (
                                <Card className="ml-8 mt-4">
                                    <CardContent className="pt-4">
                                        <Textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={`Replying to ${comment.author}...`}
                                            rows={2}
                                        />
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                        <Button onClick={() => handleAddReply(comment.id)} disabled={!replyText.trim()}>
                                            Post Reply
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

