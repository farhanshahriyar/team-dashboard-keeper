
import { DashboardLayout } from "@/components/DashboardLayout";
import { PlayerStatsChart } from "@/components/dashboard/PlayerStatsChart";
import { TournamentStatsChart } from "@/components/dashboard/TournamentStatsChart";
import { MatchStatsChart } from "@/components/dashboard/MatchStatsChart";
import { PageHeader } from "@/components/PageHeader";

export default function Index() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <PageHeader 
          title="Dashboard"
          description="Welcome to your team dashboard"
        />
        
        <div className="grid grid-cols-12 gap-6">
          <PlayerStatsChart />
          <TournamentStatsChart />
          <MatchStatsChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
