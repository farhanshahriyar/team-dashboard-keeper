
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, TrendingUp, Bell } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { toast } = useToast();
  const location = useLocation();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  // Fetch team members with optimized configuration
  const { 
    data: teamMembers, 
    isLoading: isLoadingMembers,
    isError: isMembersError,
  } = useQuery({
    queryKey: ['team_members', searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .or(`real_name.ilike.%${searchQuery}%,ign.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  // Fetch NOC records with optimized configuration
  const { 
    data: nocRecords,
    isLoading: isLoadingNOCs,
    isError: isNOCsError,
  } = useQuery({
    queryKey: ['noc_records', searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noc_records')
        .select('*')
        .or(`player_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  // Set up real-time subscription with optimized handlers
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
          queryClient.invalidateQueries({ queryKey: ['noc_records'] });
          toast({
            title: "Data Updated",
            description: "Dashboard data has been refreshed.",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['team_members'] });
          toast({
            title: "Team Members Updated",
            description: "Team members data has been refreshed.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  // Memoized chart data calculation
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

  // Memoized statistics calculation
  const stats = useMemo(() => {
    if (!nocRecords || !teamMembers) return {
      totalPlayers: 0,
      activeNOCs: 0,
      pendingNOCs: 0,
    };

    return {
      totalPlayers: teamMembers.length,
      activeNOCs: nocRecords.filter(record => 
        record.status === 'accepted' && 
        new Date(record.end_date) >= new Date()
      ).length,
      pendingNOCs: nocRecords.filter(record => record.status === 'pending').length,
    };
  }, [nocRecords, teamMembers]);

  // Loading states for cards
  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-[50px] mb-1" />
        <Skeleton className="h-4 w-[120px]" />
      </CardContent>
    </Card>
  );

  if (isMembersError || isNOCsError) {
    return (
      <DashboardLayout>
        <div className="p-4 text-red-500">
          Error loading dashboard data. Please try again later.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Dashboard"
          description="Welcome to your team dashboard"
          onSearch={(query) => {
            queryClient.invalidateQueries({
              predicate: (query) => ['team_members', 'noc_records'].includes(query.queryKey[0] as string),
            });
          }}
        />

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {isLoadingMembers || isLoadingNOCs ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="bg-gradient-to-br from-[#9b87f5] to-[#1A1F2C] text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                  <Users className="h-4 w-4 opacity-75" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPlayers}</div>
                  <p className="text-xs text-white/70 mt-1">
                    Active team members
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#D6BCFA] to-[#1A1F2C] text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active NOCs</CardTitle>
                  <FileText className="h-4 w-4 opacity-75" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeNOCs}</div>
                  <p className="text-xs text-white/70 mt-1">
                    Currently active NOCs
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#F2FCE2] to-[#1A1F2C] text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending NOCs</CardTitle>
                  <Calendar className="h-4 w-4 opacity-75" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingNOCs}</div>
                  <p className="text-xs text-white/70 mt-1">
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                NOCs Per Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingNOCs ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                      <XAxis 
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          background: "#1A1F2C",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff"
                        }}
                      />
                      <Bar 
                        dataKey="nocs" 
                        fill="#9b87f5"
                        radius={[4, 4, 0, 0]}
                        name="NOCs Issued" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                Recent NOC Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingNOCs ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {nocRecords?.slice(0, 5).map((noc: any) => (
                    <div
                      key={noc.id}
                      className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{noc.player_name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                            ${noc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              noc.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {noc.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(noc.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
