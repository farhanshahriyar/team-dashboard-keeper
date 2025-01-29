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

  // Fetch NOC records
  const { data: nocRecords, refetch } = useQuery({
    queryKey: ['noc_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noc_records')
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
          table: 'noc_records'
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
    if (!nocRecords) return [];

    const monthlyData = nocRecords.reduce((acc: any, record: any) => {
      const month = format(new Date(record.created_at), 'MMM');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      nocs: count,
    }));
  }, [nocRecords]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!nocRecords) return {
      totalPlayers: 0,
      activeNOCs: 0,
      pendingNOCs: 0,
    };

    return {
      totalPlayers: new Set(nocRecords.map(record => record.player_name)).size,
      activeNOCs: nocRecords.filter(record => 
        record.status === 'accepted' && 
        new Date(record.end_date) >= new Date()
      ).length,
      pendingNOCs: nocRecords.filter(record => record.status === 'pending').length,
    };
  }, [nocRecords]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-[#DC2626] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#DC2626] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active NOCs</CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeNOCs}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#DC2626] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending NOCs</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingNOCs}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>NOCs Per Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="nocs" fill="#DC2626" name="NOCs Issued" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent NOC Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nocRecords?.slice(0, 5).map((noc: any) => (
                  <div
                    key={noc.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{noc.player_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {noc.status}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(noc.created_at), 'yyyy-MM-dd')}
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