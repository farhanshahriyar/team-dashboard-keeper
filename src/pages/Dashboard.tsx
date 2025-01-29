import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Dashboard = () => {
  const { toast } = useToast();

  // Fetch team members data
  const { data: teamMembers, refetch } = useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        },
        () => {
          refetch();
          toast({
            title: "Data Updated",
            description: "Dashboard data has been refreshed.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  // Process data for the chart
  const chartData = useMemo(() => {
    if (!teamMembers) return [];

    const monthlyData = teamMembers.reduce((acc: any, member: any) => {
      const month = format(new Date(member.created_at), 'MMM');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      members: count,
    }));
  }, [teamMembers]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!teamMembers) return {
      totalMembers: 0,
      activeRoles: 0,
      pendingMembers: 0,
    };

    return {
      totalMembers: teamMembers.length,
      activeRoles: new Set(teamMembers.map(member => member.game_role)).size,
      pendingMembers: teamMembers.filter(member => !member.picture).length, // Using missing picture as pending indicator
    };
  }, [teamMembers]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Team Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-[#DC2626] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#DC2626] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRoles}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#DC2626] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Members</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingMembers}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Members Per Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="members" fill="#DC2626" name="Team Members" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers?.slice(0, 5).map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{member.real_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Role: {member.game_role}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(member.created_at), 'yyyy-MM-dd')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;