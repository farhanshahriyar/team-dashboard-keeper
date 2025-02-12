
import { Users, Calendar, LayoutDashboard, UserCog, LogOut, Settings, Megaphone, Trophy, History, ClipboardCheck, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    title: "KR Announcements",
    path: "/announcements",
    icon: Megaphone,
  },
  {
    title: "NOC Management",
    path: "/noc",
    icon: Calendar,
  },
  {
    title: "Team Members",
    path: "/members",
    icon: Users,
  },
  {
    title: "Player Management",
    path: "/player-management",
    icon: UserCog,
  },
  {
    title: "Tournaments",
    path: "/tournaments",
    icon: Trophy,
  },
  {
    title: "Match History",
    path: "/match-history",
    icon: History,
  },
  {
    title: "Attendance",
    path: "/attendance",
    icon: ClipboardCheck,
  },
];

const SidebarNav = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<{
    email?: string;
    display_name?: string;
    avatar_url?: string;
  } | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('email, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-2 py-6 hover:bg-white/5 transition-colors rounded-lg">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url || "/lovable-uploads/fcd52d32-7c9b-477f-803e-c19c7824c121.png"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || 'KR'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start justify-center">
                <span className="text-sm font-semibold text-foreground/90">
                  {profile?.display_name || 'KingsRock User'}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {profile?.email || 'Loading...'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 backdrop-blur-xl bg-background/80" align="start" side="right">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.title}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-white/5 text-foreground/80 hover:text-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground group-hover:text-foreground transition-colors"
                }`} />
                <span className="font-medium text-sm">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export function DashboardSidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-background/95 backdrop-blur-xl">
            <SidebarNav />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Sidebar className="hidden md:block border-r border-border/10 bg-background/95 backdrop-blur-xl min-h-screen w-64">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarNav />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
