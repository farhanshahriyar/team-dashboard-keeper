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

export interface UploadedFile {
  id: string;
  noc_id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
}