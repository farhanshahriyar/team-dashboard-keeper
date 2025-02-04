export interface NocRecord {
  id: string;
  player_name: string;
  email: string;
  type: 'noc' | 'leave' | 'absent';
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}