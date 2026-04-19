import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Shield, UserCog, User, ChevronDown } from "lucide-react";

interface RoleManagementProps {
  userId: string;
  userName: string;
  currentRole: string;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  disabled?: boolean;
}

export const RoleManagement = ({
  userId,
  userName,
  currentRole,
  onRoleChange,
  disabled = false,
}: RoleManagementProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3" />;
      case "moderator":
        return <UserCog className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full access to admin panel, can manage all users, drills, and system settings.";
      case "moderator":
        return "Can moderate content and manage user reports (future feature).";
      default:
        return "Standard coach with access to create drills and engage with the community.";
    }
  };

  const handleRoleSelect = (newRole: string) => {
    if (newRole === currentRole) return;
    setPendingRole(newRole);
    setShowConfirmDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingRole) return;
    await onRoleChange(userId, pendingRole);
    setShowConfirmDialog(false);
    setPendingRole(null);
  };

  const cancelRoleChange = () => {
    setShowConfirmDialog(false);
    setPendingRole(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant={getRoleBadgeVariant(currentRole)} className="gap-1">
          {getRoleIcon(currentRole)}
          {currentRole}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background border shadow-lg z-50">
            <DropdownMenuItem
              onClick={() => handleRoleSelect("user")}
              disabled={currentRole === "user"}
              className="cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" />
              User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleSelect("moderator")}
              disabled={currentRole === "moderator"}
              className="cursor-pointer"
            >
              <UserCog className="w-4 h-4 mr-2" />
              Moderator
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleSelect("admin")}
              disabled={currentRole === "admin"}
              className="cursor-pointer"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to change <strong>{userName}'s</strong> role from{" "}
                <strong>{currentRole}</strong> to <strong>{pendingRole}</strong>?
              </p>
              {pendingRole && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">New Role: {pendingRole}</p>
                  <p className="text-muted-foreground">{getRoleDescription(pendingRole)}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                This action will be logged in the audit log.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRoleChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
