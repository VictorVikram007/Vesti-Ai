
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const navLinks = [
    { to: "/", label: "Dashboard", icon: "dashboard" },
    { to: "/closet", label: "My Closet", icon: "closet" },
    { to: "/outfits", label: "Outfits", icon: "outfits" },
    { to: "/trends", label: "Trends", icon: "trends" },
    { to: "/persona-setup", label: "Style Persona", icon: "persona" },
    { to: "/ai-chat", label: "AI Chat", icon: "chat" },
    { to: "/ai-outfits", label: "Style AI", icon: "ai-outfits" },
    { to: "/colors", label: "Color Palette", icon: "colors" },
    { to: "/feedback", label: "Community", icon: "community" },
    { to: "/store", label: "Store", icon: "store" },
    { to: "/add-item", label: "Add Item", icon: "add" },
  ];

  const getLinkIcon = (icon: string) => {
    switch (icon) {
      case "dashboard":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 9h.01" />
            <path d="M15 9h.01" />
            <path d="M9 15h.01" />
            <path d="M15 15h.01" />
          </svg>
        );
      case "closet":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M20 7h-5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" />
            <path d="M9 7H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" />
            <path d="M9 16H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1Z" />
            <path d="M20 16h-5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1Z" />
          </svg>
        );
      case "outfits":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M5.2 8.2A4 4 0 0 1 7.9 7h8.2a4 4 0 0 1 2.7 1.2L22 10c1 1 1 2 0 3l-9 9c-1 1-2 1-3 0l-9-9c-1-1-1-2 0-3l3.2-1.8" />
            <path d="m12 6 4-4" />
            <path d="M16 6V2" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        );
      case "trends":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M3 3l18 18" />
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        );
      case "chat":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case "community":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M8 21l4-7 4 7" />
            <path d="M12 21v-7" />
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        );

      case "ai-outfits":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case "colors":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <circle cx="13.5" cy="6.5" r=".5" />
            <circle cx="17.5" cy="10.5" r=".5" />
            <circle cx="8.5" cy="7.5" r=".5" />
            <circle cx="6.5" cy="12.5" r=".5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          </svg>
        );
      case "persona":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case "store":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
            <path d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
            <path d="M8 7V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
          </svg>
        );
      case "add":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-background border-r border-border fixed md:relative z-10 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0 md:w-16 overflow-hidden"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between h-16 border-b border-border">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <img src="/logo-ui.png" alt="Vesti AI" className="h-12 w-12 rounded-sm" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
              <h1 className="font-semibold text-lg text-wardrobe-navy">Vesti AI</h1>
            </div>
          ) : (
            <img src="/logo-ui.png" alt="Vesti AI" className="h-10 w-10" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(!isOpen && "md:flex hidden", isOpen && "md:flex")}
            onClick={toggleSidebar}
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
              className="h-5 w-5"
            >
              {isOpen ? (
                <>
                  <path d="m15 6-6 6 6 6" />
                </>
              ) : (
                <>
                  <path d="m9 6 6 6-6 6" />
                </>
              )}
            </svg>
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-wardrobe-teal/10 text-wardrobe-teal font-medium"
                        : "text-foreground hover:bg-muted"
                    )
                  }
                >
                  {getLinkIcon(link.icon)}
                  {isOpen && <span>{link.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-border">
          <NavLink 
            to="/settings" 
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-wardrobe-teal/10 text-wardrobe-teal font-medium"
                  : "text-foreground hover:bg-muted"
              )
            }
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
              className="h-5 w-5"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {isOpen && <span>Settings</span>}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
