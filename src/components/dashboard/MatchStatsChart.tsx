import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671'];

export function MatchStatsChart() {
  const { data: matches } = useQuery({
    queryKey: ['match-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_history')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const typeStats = matches?.reduce((acc: any, match) => {
    acc[match.type] = (acc[match.type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(typeStats || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Match Type Distribution</CardTitle>
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