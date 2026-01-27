export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  vessel_name: string | null;
  vessel_length: number | null;
  home_port: string | null;
  bio: string | null;
  latitude: number | null;
  longitude: number | null;
  show_on_map: boolean;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  from_user: string;
  to_user: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type BlockedUser = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
};

// For API responses
export type ProfileWithOnlineStatus = Profile & {
  is_online: boolean;
  is_current_user: boolean;
};

export type ConversationPreview = {
  user: Profile;
  last_message: Message;
  unread_count: number;
};
