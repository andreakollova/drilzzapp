import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    name: string;
    club: string | null;
    avatar_url: string | null;
  } | null;
  replies?: Comment[];
}

interface CommentsProps {
  drillId: string;
  userId: string;
}

export const Comments = ({ drillId, userId }: CommentsProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const COMMENTS_PER_PAGE = 10;

  useEffect(() => {
    loadComments(true);
    
    // Subscribe to new comments
    const channel = supabase
      .channel(`drill_comments:${drillId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `drill_id=eq.${drillId}`
        },
        (payload) => {
          loadComments(true); // Reload from start to get new comment
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `drill_id=eq.${drillId}`
        },
        (payload) => {
          loadComments(true); // Reload after deletion
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `drill_id=eq.${drillId}`
        },
        (payload) => {
          loadComments(true); // Reload after update
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [drillId]);

  const loadComments = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const currentCount = reset ? 0 : comments.length;

      // Get total count
      const { count } = await supabase
        .from("comments")
        .select("id", { count: 'exact', head: true })
        .eq("drill_id", drillId)
        .is("parent_id", null);

      setTotalCount(count || 0);

      // Fetch paginated root comments (parent comments only)
      const { data: rootCommentData, error: rootError } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_id,
          profiles:user_id (name, club, avatar_url)
        `)
        .eq("drill_id", drillId)
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .range(currentCount, currentCount + COMMENTS_PER_PAGE - 1);

      if (rootError) throw rootError;

      // For each root comment, fetch all its nested replies
      const commentIds = rootCommentData?.map(c => c.id) || [];
      
      let allReplies: any[] = [];
      if (commentIds.length > 0) {
        const { data: repliesData, error: repliesError } = await supabase
          .from("comments")
          .select(`
            id,
            content,
            created_at,
            user_id,
            parent_id,
            profiles:user_id (name, club, avatar_url)
          `)
          .eq("drill_id", drillId)
          .in("parent_id", commentIds)
          .order("created_at", { ascending: true });

        if (repliesError) throw repliesError;
        allReplies = repliesData || [];
      }

      // Organize into nested structure
      const commentMap = new Map<string, Comment>();
      const newRootComments: Comment[] = [];

      // Create all comment objects
      rootCommentData?.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      allReplies.forEach(reply => {
        commentMap.set(reply.id, { ...reply, replies: [] });
      });

      // Organize replies into tree
      allReplies.forEach(reply => {
        const replyObj = commentMap.get(reply.id)!;
        const parent = commentMap.get(reply.parent_id!);
        if (parent) {
          parent.replies!.push(replyObj);
        }
      });

      // Build root comments array
      rootCommentData?.forEach(comment => {
        newRootComments.push(commentMap.get(comment.id)!);
      });

      if (reset) {
        setComments(newRootComments);
      } else {
        setComments(prev => [...prev, ...newRootComments]);
      }

      setHasMore((count || 0) > (reset ? 0 : currentCount) + newRootComments.length);
    } catch (error: any) {
      console.error("Error loading comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreComments = () => {
    if (!loadingMore && hasMore) {
      loadComments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();

    const content = parentId ? replyContent : newComment;
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      toast({
        title: "Validation Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (trimmedContent.length > 1000) {
      toast({
        title: "Validation Error",
        description: "Comment must be less than 1000 characters",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          drill_id: drillId,
          user_id: userId,
          content: trimmedContent,
          parent_id: parentId
        });

      if (error) throw error;

      toast({
        title: parentId ? "Reply Posted" : "Comment Posted",
        description: parentId ? "Your reply has been added" : "Your comment has been added"
      });

      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
      
      loadComments(true); // Refresh comments from start
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    const trimmedContent = editContent.trim();
    
    if (!trimmedContent) {
      toast({
        title: "Validation Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (trimmedContent.length > 1000) {
      toast({
        title: "Validation Error",
        description: "Comment must be less than 1000 characters",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("comments")
        .update({ content: trimmedContent })
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Comment Updated",
        description: "Your comment has been updated"
      });

      setEditingCommentId(null);
      setEditContent("");
      loadComments(true);
    } catch (error: any) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted"
      });

      setDeletingCommentId(null);
      loadComments(true);
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isReplying = replyingTo === comment.id;
    const isNested = depth > 0;
    
    // Handle deleted users
    const userName = comment.profiles?.name || "Deleted User";
    const userClub = comment.profiles?.club;
    const userAvatar = comment.profiles?.avatar_url;
    const isDeletedUser = !comment.profiles;

    return (
      <div key={comment.id} className={isNested ? "ml-10 mt-4" : "mt-6"}>
        <div className="flex gap-3">
          {isDeletedUser ? (
            <Avatar className="w-9 h-9 flex-shrink-0 opacity-50">
              <AvatarFallback className="bg-muted text-muted-foreground">
                ?
              </AvatarFallback>
            </Avatar>
          ) : (
            <Link to={`/profile/${comment.user_id}`}>
              <Avatar className="w-9 h-9 hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0">
                <AvatarImage src={userAvatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          
          <div className="flex-1 min-w-0">
            {/* Edit Form or Content */}
            {editingCommentId === comment.id ? (
              <form onSubmit={(e) => { e.preventDefault(); handleEdit(comment.id); }} className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  disabled={submitting}
                  className="resize-none text-sm"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditContent("");
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || !editContent.trim()}
                    size="sm"
                  >
                    {submitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2">
                    {isDeletedUser ? (
                      <span className="text-sm font-semibold text-muted-foreground">
                        {userName}
                      </span>
                    ) : (
                      <Link 
                        to={`/profile/${comment.user_id}`}
                        className="text-sm font-semibold hover:opacity-70 transition-opacity"
                      >
                        {userName}
                      </Link>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {userId === comment.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditContent(comment.content);
                          }}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingCommentId(comment.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {userClub && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {userClub}
                    </p>
                  )}
                </div>
                
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-1">
                  {comment.content}
                </p>

                {/* Action Links */}
                {depth < 3 && (
                  <button
                    onClick={() => {
                      setReplyingTo(isReplying ? null : comment.id);
                      setReplyContent("");
                    }}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mt-2"
                  >
                    {isReplying ? "Cancel" : "Reply"}
                  </button>
                )}
              </>
            )}

            {/* Reply Form */}
            {isReplying && (
              <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 flex gap-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  disabled={submitting}
                  className="resize-none text-sm flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={submitting || !replyContent.trim()}
                  size="sm"
                  className="self-end"
                >
                  {submitting ? "Posting..." : "Post"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="font-display text-xl mb-4">
        Comments {totalCount > 0 && `(${totalCount})`}
      </h2>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2 items-center">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={1}
            disabled={submitting}
            className="resize-none text-sm flex-1 min-h-[36px] py-2"
          />
          <Button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            size="sm"
          >
            {submitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="pb-4">
        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {comments.map((comment) => renderComment(comment, 0))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-6">
                <Button
                  variant="ghost"
                  onClick={loadMoreComments}
                  disabled={loadingMore}
                  className="text-sm"
                >
                  {loadingMore ? "Loading..." : `Load more comments`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCommentId} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
              {comments.some(c => c.id === deletingCommentId && c.replies && c.replies.length > 0) && 
                " All replies to this comment will also be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCommentId && handleDelete(deletingCommentId)}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
