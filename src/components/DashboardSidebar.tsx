
import { Users, Calendar, LayoutDashboard, UserCog, LogOut, Settings, Megaphone, Trophy, History, ClipboardCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

export function DashboardSidebar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
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
    <Sidebar className="border-r border-border/10 bg-background/5 backdrop-blur-xl min-h-screen w-64">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
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
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path} 
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 group"
                    >
                      <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
