import { useLocation, Link } from "react-router-dom";
import { LayoutGrid, Search, Plus, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MobileBottomNavProps {
  userId?: string;
  profile?: {
    avatar_url?: string | null;
    name?: string | null;
  } | null;
}

export const MobileBottomNav = ({ userId, profile }: MobileBottomNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { label: "Search", path: "/search", icon: Search },
    { label: "Create", path: "/create", icon: Plus, isCreate: true },
    { label: "Library", path: "/library", icon: BookOpen },
    { label: "Profile", path: `/profile/${userId}`, icon: null, isProfile: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.isCreate ? (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-transform ring-4 ring-background">
                    <Plus className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              ) : item.isProfile ? (
                <Avatar className={cn("h-6 w-6", isActive && "ring-2 ring-primary")}>
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px] bg-muted">
                    {getInitials(profile?.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                Icon && <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              )}
              <span className={cn("text-xs font-medium", item.isCreate && "mt-6")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
