import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Trash2, ExternalLink, MessageSquare } from "lucide-react";
import { AdminTableSkeleton } from "@/components/AdminLoadingSkeleton";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { AdminFiltersComponent, AdminFilters } from "@/components/AdminFilters";
import { isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  drill_id: string;
  user_id: string;
  profiles: {
    name: string;
    email: string;
  };
  drills: {
    title: string;
  };
}

interface AdminCommentsTableProps {
  loading: boolean;
  onRefresh: () => void;
}

export const AdminCommentsTable = ({ loading, onRefresh }: AdminCommentsTableProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminFilters>({});
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:user_id (name, email),
          drills:drill_id (title)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error("Error loading comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment? This action cannot be undone.")) return;

    try {
      setDeletingComment(commentId);
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({ title: "Comment deleted successfully" });
      
      // Remove comment from local state
      setComments(comments.filter(c => c.id !== commentId));
      onRefresh();
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive"
      });
    } finally {
      setDeletingComment(null);
    }
  };

  const applyFilters = (items: Comment[]) => {
    return items.filter(item => {
      if (filters.dateFrom) {
        const itemDate = new Date(item.created_at);
        if (isBefore(itemDate, startOfDay(filters.dateFrom))) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const itemDate = new Date(item.created_at);
        if (isAfter(itemDate, endOfDay(filters.dateTo))) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredComments = applyFilters(
    comments.filter(comment =>
      comment.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.drills?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading || commentsLoading) {
    return <AdminTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search comments by content, author, or drill title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <AdminFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        filterType="comments"
      />

      {filteredComments.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {searchQuery ? "No comments found matching your search" : "No comments found"}
          </p>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Comment</TableHead>
                <TableHead className="min-w-[120px]">Author</TableHead>
                <TableHead className="min-w-[150px]">Drill</TableHead>
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead className="text-right min-w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-[300px]">
                    <p className="text-sm line-clamp-2">{comment.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{comment.profiles?.name}</span>
                      <span className="text-xs text-muted-foreground">{comment.profiles?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{comment.drills?.title}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/drills/${comment.drill_id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingComment === comment.id}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
