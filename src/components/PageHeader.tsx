
import React, { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface PageHeaderProps {
  title: string;
  description?: string;
  onSearch?: (query: string) => void;  // Added onSearch prop
}

export function PageHeader({ title, description, onSearch }: PageHeaderProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Create a URLSearchParams object with current params
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('search', searchQuery.trim());
    
    // Navigate to the same route but with search parameter
    navigate(`${location.pathname}?${searchParams.toString()}`);
    
    // If onSearch prop is provided, call it
    if (onSearch) {
      onSearch(searchQuery.trim());
    }

    // Invalidate relevant queries to trigger a refetch with search params
    queryClient.invalidateQueries({
      predicate: (query) => 
        query.queryKey[0] === 'team-members' ||
        query.queryKey[0] === 'noc_records' ||
        query.queryKey[0] === 'daily-attendance' ||
        query.queryKey[0] === 'tournaments'
    });
    
    toast({
      title: "Search initiated",
      description: `Searching for "${searchQuery}"`,
    });
  };

  // Reset search when route changes
  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "No new notifications at this time.",
    });
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 w-[200px] bg-white dark:bg-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <button 
          onClick={handleNotificationClick}
          className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>
      </div>
    </div>
  );
}
