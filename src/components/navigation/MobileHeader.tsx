import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Bell, Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
  showNotifications?: boolean;
  onMenuClick?: () => void;
}

export function MobileHeader({ 
  title, 
  showLogo = true, 
  showNotifications = false,
  onMenuClick 
}: MobileHeaderProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ').filter(Boolean);
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0]?.substring(0, 2).toUpperCase() || '??';
    }
    return user?.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          {showLogo && (
            <Logo variant="full" size="lg" />
          )}
          
          {title && (
            <h1 className="font-semibold text-lg truncate">{title}</h1>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {showNotifications && (
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5" />
            </Button>
          )}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center p-0 hover:bg-primary/20 transition-colors overflow-hidden"
                >
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium text-primary">
                      {getInitials()}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
