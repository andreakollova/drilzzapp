import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Shield, 
  Trash2, 
  UserCog, 
  Clock,
  RefreshCw,
  FileText
} from "lucide-react";
import { AdminTableSkeleton } from "./AdminLoadingSkeleton";

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: any;
  new_value: any;
  metadata: any;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

export const AuditLogViewer = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      // First get the audit logs
      const { data: logsData, error: logsError } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Then get profile info for each unique actor
      const actorIds = [...new Set(logsData?.map(log => log.actor_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", actorIds);

      if (profilesError) throw profilesError;

      // Map profiles to logs
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const enrichedLogs = logsData?.map(log => ({
        ...log,
        profiles: profilesMap.get(log.actor_id)
      })) || [];

      setLogs(enrichedLogs);
    } catch (error: any) {
      console.error("Error loading audit logs:", error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "role_assigned":
      case "role_removed":
        return <UserCog className="w-4 h-4" />;
      case "drill_deleted":
        return <Trash2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActionBadgeVariant = (action: string): "default" | "destructive" | "secondary" => {
    if (action.includes("delete")) return "destructive";
    if (action.includes("assigned")) return "default";
    return "secondary";
  };

  const formatActionDescription = (log: AuditLog) => {
    switch (log.action) {
      case "role_assigned":
        return `Assigned role: ${log.new_value?.role}`;
      case "role_removed":
        return `Removed role: ${log.old_value?.role}`;
      case "drill_deleted":
        return `Deleted drill: "${log.old_value?.title}" (${log.old_value?.sport})`;
      default:
        return log.action;
    }
  };

  if (loading) {
    return <AdminTableSkeleton />;
  }

  if (logs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No audit logs found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Activity Audit Log</h3>
          <p className="text-sm text-muted-foreground">
            Showing last 100 admin actions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAuditLogs}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getActionIcon(log.action)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getActionBadgeVariant(log.action)}>
                    {log.action.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{log.profiles?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.profiles?.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="text-sm">{formatActionDescription(log)}</p>
                    {log.entity_type && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Entity: {log.entity_type}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {format(new Date(log.created_at), "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "HH:mm:ss")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
