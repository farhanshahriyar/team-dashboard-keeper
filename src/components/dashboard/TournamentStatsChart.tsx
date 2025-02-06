import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

export function TournamentStatsChart() {
  const { data: tournaments } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const statusStats = tournaments?.reduce((acc: any, tournament) => {
    acc[tournament.status] = (acc[tournament.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(statusStats || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Tournament Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}