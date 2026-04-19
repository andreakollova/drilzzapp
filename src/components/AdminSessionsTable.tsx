import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Trash2, ExternalLink, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SPORTS } from "@/config/sports";

interface Session {
  id: string;
  name: string;
  description: string | null;
  sport: string;
  total_duration: number | null;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    email: string;
  } | null;
  drill_count: number;
}

export function AdminSessionsTable() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadSessions();
  }, [searchQuery, sportFilter, dateFrom, dateTo]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("training_sessions")
        .select(`
          id,
          name,
          description,
          sport,
          total_duration,
          created_at,
          user_id,
          profiles!training_sessions_user_id_fkey (name, email)
        `)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (sportFilter && sportFilter !== "all") {
        query = query.eq("sport", sportFilter);
      }

      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("created_at", `${dateTo}T23:59:59`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Get drill counts for each session
      const sessionsWithCounts = await Promise.all(
        (data || []).map(async (session) => {
          const { count } = await supabase
            .from("session_drills")
            .select("*", { count: "exact", head: true })
            .eq("session_id", session.id);

          return {
            ...session,
            profiles: session.profiles as Session["profiles"],
            drill_count: count || 0,
          };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // First delete session drills
      await supabase.from("session_drills").delete().eq("session_id", sessionId);

      // Then delete the session
      const { error } = await supabase
        .from("training_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Session deleted",
        description: "The training session has been deleted successfully.",
      });

      loadSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSportFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by session name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="text-sm font-medium mb-1.5 block">Sport</label>
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sports</SelectItem>
              {SPORTS.map((sport) => (
                <SelectItem key={sport} value={sport.toLowerCase().replace(/[\/\s]+/g, "-")}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-40">
          <label className="text-sm font-medium mb-1.5 block">From</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-full md:w-40">
          <label className="text-sm font-medium mb-1.5 block">To</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Button variant="outline" onClick={clearFilters} className="shrink-0">
          Clear
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {sessions.length} session{sessions.length !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No sessions found matching your filters.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead className="text-center">Drills</TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{session.name}</p>
                      {session.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {session.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.profiles?.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.profiles?.email || "No email"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{session.sport.replace("-", " ")}</span>
                  </TableCell>
                  <TableCell className="text-center">{session.drill_count}</TableCell>
                  <TableCell className="text-center">
                    {session.total_duration ? `${session.total_duration} min` : "-"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(session.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/sessions/${session.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Session</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{session.name}"? This will also remove all associated drill assignments. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSession(session.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
}