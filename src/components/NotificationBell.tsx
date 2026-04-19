import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface NotificationBellProps {
  unreadCount: number;
}

export const NotificationBell = ({ unreadCount }: NotificationBellProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative flex-shrink-0"
      onClick={() => navigate("/notifications")}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs pointer-events-none"
          variant="destructive"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
};
