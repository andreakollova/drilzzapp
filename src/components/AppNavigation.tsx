import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NotificationBell } from "@/components/NotificationBell";
import { UserMenu } from "@/components/UserMenu";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNotifications } from "@/hooks/useNotifications";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import logoBlack from "@/assets/logo-black.png";
import logoWhite from "@/assets/logo-white.png";

interface AppNavigationProps {
  userId?: string;
  profile?: any;
}

export const AppNavigation = ({ userId, profile }: AppNavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications(userId);
  const { isAdmin } = useAdminCheck();
  const { resolvedTheme } = useTheme();
  const location = useLocation();

  const currentPath = location.pathname;
  const isDashboard = currentPath === "/dashboard";
  const isLibraryOrCollections = ["/library", "/collections"].some(p => currentPath.startsWith(p));
  const isDiscoveryPage = ["/feed", "/community", "/search"].some(p => currentPath.startsWith(p));

  const logo = resolvedTheme === "dark" ? logoWhite : logoBlack;

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/feed", label: "Feed" },
    { to: "/community", label: "Community" },
    { to: "/search", label: "Search" },
    ...(!isDashboard ? [
      { to: "/library", label: "Library" },
      { to: "/collections", label: "Collections" },
    ] : []),
  ];

  return (
    <>
      <nav className="nav-blur bg-background/80 dark:bg-[rgba(0,0,0,0.6)] border-b border-border/60 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 md:h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-8 flex-1 min-w-0">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-background border-border/60 z-50">
                <div className="flex flex-col gap-1 mt-8">
                  {navLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors py-3 px-3 rounded-xl"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/dashboard" className="flex items-center flex-shrink-0">
              <img src={logo} alt="Drilzz" className="h-6 md:h-7" />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium px-3 py-2 rounded-full transition-all duration-200 ${
                    currentPath === link.to
                      ? "text-foreground bg-muted nav-active-dot"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <ThemeToggle />
            {isDiscoveryPage && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="icon" variant="ghost" className="hidden md:inline-flex rounded-full">
                    <Link to="/create">
                      <Plus className="w-5 h-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Create Drill</p></TooltipContent>
              </Tooltip>
            )}
            {!isDiscoveryPage && !isLibraryOrCollections && !isDashboard && (
              <Button asChild size="sm" className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/create">
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </Link>
              </Button>
            )}
            {userId && <NotificationBell unreadCount={unreadCount} />}
            {profile && userId && <UserMenu profile={profile} userId={userId} isAdmin={isAdmin} />}
          </div>
        </div>
      </nav>

      {userId && <MobileBottomNav userId={userId} profile={profile} />}
    </>
  );
};
