import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Announcements from "@/pages/Announcements";
import Noc from "@/pages/Noc";
import NocApplications from "@/pages/NocApplications";
import Members from "@/pages/Members";
import PlayerManagement from "@/pages/PlayerManagement";
import Tournaments from "@/pages/Tournaments";
import Account from "@/pages/Account";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/noc" element={<Noc />} />
              <Route path="/allnoc-applications" element={<NocApplications />} />
              <Route path="/members" element={<Members />} />
              <Route path="/player-management" element={<PlayerManagement />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;