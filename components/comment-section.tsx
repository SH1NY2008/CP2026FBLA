
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/firebase"
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "firebase/firestore"
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
}

interface CommentSectionProps {
    placeId: string;
}

export function CommentSection({ placeId }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!placeId) return;

        // Query without orderBy to avoid needing a composite index
        const q = query(collection(db, "comments"), where("placeId", "==", placeId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const commentsData: Comment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Handle the case where the timestamp is not yet populated by the server
                commentsData.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
                } as Comment);
            });

            // Sort comments on the client side
            commentsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            setComments(commentsData);
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
        });

        setNewComment("");
    };

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
                        <CommentCard key={comment.id} comment={comment} />
                    ))}
                </div>
            )}
        </div>
    )
}

