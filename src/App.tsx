import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import Tournaments from "@/pages/Tournaments";
import Announcements from "@/pages/Announcements";
import Account from "@/pages/Account";
import Noc from "@/pages/Noc";
import PlayerManagement from "@/pages/PlayerManagement";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/account" element={<Account />} />
              <Route path="/noc" element={<Noc />} />
              <Route path="/player-management" element={<PlayerManagement />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;