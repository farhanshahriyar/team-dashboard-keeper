import { DashboardLayout } from "@/components/DashboardLayout";
import { PlayerStatsChart } from "@/components/dashboard/PlayerStatsChart";
import { TournamentStatsChart } from "@/components/dashboard/TournamentStatsChart";
import { MatchStatsChart } from "@/components/dashboard/MatchStatsChart";

export default function Index() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-12 gap-6">
          <PlayerStatsChart />
          <TournamentStatsChart />
          <MatchStatsChart />
        </div>
      </div>
    </DashboardLayout>
  );
}