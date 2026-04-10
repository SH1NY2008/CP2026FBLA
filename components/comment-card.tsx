
"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, ThumbsUp, ThumbsDown, MessageSquare, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface Comment {
    id: string;
    author: string;
    authorId: string;
    text: string;
    timestamp: Date;
    avatarUrl?: string;
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
}

export function CommentCard({ comment, onLike, onDislike, onReply, onDelete }: CommentCardProps) {
    const { user } = useAuth();
    const [showReplies, setShowReplies] = useState(false);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                        <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{comment.author}</p>
                        <p className="text-sm text-muted-foreground">{comment.timestamp.toLocaleDateString()}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {user && user.uid === comment.authorId && (
                            <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <p>{comment.text}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => onLike(comment.id)}>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDislike(comment.id)}>
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        {comment.dislikes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onReply(comment.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply
                    </Button>
                </div>
                {comment.replies && comment.replies.length > 0 && (
                    <Button variant="link" onClick={() => setShowReplies(!showReplies)}>
                        {showReplies ? "Hide" : "View"} {comment.replies.length} replies
                    </Button>
                )}
            </CardFooter>
            {showReplies && comment.replies && (
                <div className="ml-8 pl-4 border-l-2 border-gray-200">
                    {comment.replies.map((reply) => (
                        <CommentCard
                            key={reply.id}
                            comment={reply}
                            onLike={onLike}
                            onDislike={onDislike}
                            onReply={onReply}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </Card>
    )
}
