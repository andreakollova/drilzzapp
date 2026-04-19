import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Check, Heart, MessageSquare, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { AppNavigation } from "@/components/AppNavigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function Notifications() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(userId);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);

    // Get profile for AppNavigation
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    setProfile(profileData);
    setUserLoading(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follower":
        return <UserPlus className="w-5 h-5 text-blue-600" />;
      case "like":
        return <Heart className="w-5 h-5 text-red-600" />;
      case "comment":
      case "reply":
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5" />;
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

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to relevant page
    if (notification.type === "follower") {
      navigate(`/profile/${notification.actor_id}`);
    } else if (notification.drill_id) {
      navigate(`/drill/${notification.drill_id}`);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation userId={userId || undefined} profile={profile} />
        
        <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-3xl">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-7 w-40 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
            </div>
          </div>

          {/* Notifications Skeleton */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border-b border-border animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                    <div className="h-3 w-1/4 bg-muted rounded"></div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <MobileBottomNav userId={userId || undefined} profile={profile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation userId={userId || undefined} profile={profile} />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg mb-2">
              No notifications yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              When coaches interact with your drills or follow you, you'll see notifications here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 cursor-pointer transition-all hover:bg-muted/50 rounded-lg ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge variant="default" className="shrink-0">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Avatar */}
                  {notification.actor && (
                    <Link 
                      to={`/profile/${notification.actor_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0"
                    >
                      <Avatar className="w-10 h-10 hover:opacity-80 transition-opacity">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(notification.actor.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <MobileBottomNav userId={userId || undefined} profile={profile} />
    </div>
  );
}