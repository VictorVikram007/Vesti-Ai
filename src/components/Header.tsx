
import { Button } from "@/components/ui/button";
import { Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { settings } = useSettings();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully signed out.",
      });
      navigate('/login', { replace: true });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-background border-b border-border h-16 flex items-center px-4 justify-between">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="md:hidden"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </Button>
      
      import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import logoUiUrl from '/logo-ui.png';

interface HeaderProps {
  toggleSidebar: () => void;
}
//...
        </svg>
      </Button>
      
      <div className="flex items-center gap-3">
        <img src={logoUiUrl} alt="Vesti AI" className="h-10 w-10" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
        <span className="font-bold text-lg text-wardrobe-navy">Vesti AI</span>
      </div>
      
      <div className="relative max-w-md w-full hidden md:flex ml-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search your wardrobe..." 
          className="pl-8 w-full" 
        />
      </div>

// ... existing code ...
      </Button>
      
      <div className="flex items-center gap-3">
        <img src={logoUiUrl} alt="Vesti AI" className="h-10 w-10" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
        <span className="font-bold text-lg text-wardrobe-navy">Vesti AI</span>
      </div>
      
      <div className="relative max-w-md w-full hidden md:flex ml-4">
// ... existing code ...
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search your wardrobe..." 
          className="pl-8 w-full" 
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-wardrobe-teal/50 transition-all">
              <AvatarImage 
                src={settings.profile.avatarDataUrl} 
                alt="Profile" 
              />
              <AvatarFallback className="bg-wardrobe-navy text-white text-sm font-medium">
                {settings.profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
