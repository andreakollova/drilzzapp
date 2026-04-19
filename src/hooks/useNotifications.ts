import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: "follower" | "like" | "comment" | "reply";
  drill_id: string | null;
  comment_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
  actor?: {
    name: string;
    club: string | null;
  };
}

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadNotifications();

    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadNotifications(); // Reload when new notification arrives
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadNotifications(); // Reload when notification is updated
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;

    try {
      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (notificationsError) throw notificationsError;

      // Fetch actor profiles for all notifications
      const actorIds = [...new Set(notificationsData?.map(n => n.actor_id) || [])];
      
      if (actorIds.length > 0) {
        const { data: actorsData, error: actorsError } = await supabase
          .from("profiles")
          .select("id, name, club")
          .in("id", actorIds);

        if (actorsError) throw actorsError;

        // Create a map of actor data
        const actorMap = new Map(actorsData?.map(a => [a.id, a]) || []);

        // Combine notifications with actor data
        const enrichedNotifications = notificationsData?.map(n => ({
          ...n,
          actor: actorMap.get(n.actor_id),
        })) || [];

        setNotifications(enrichedNotifications as Notification[]);
        setUnreadCount(enrichedNotifications.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
};
