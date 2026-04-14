export interface Profile {
  id: string;
  display_name: string;
  vessel_name?: string;
  boat_name?: string;
  bio?: string;
  avatar_url?: string;
  show_on_map: boolean;
}

export interface CheckedInUser {
  id: string;
  user_id: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  anchorage_id?: string;
  note?: string;
  checked_in_at: string;
  expires_at: string;
  profiles: {
    id: string;
    display_name: string;
    vessel_name?: string;
    boat_name?: string;
    avatar_url?: string;
    show_on_map: boolean;
  };
}

export interface MyCheckin {
  id: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  anchorage_id?: string;
  note?: string;
  visibility?: string;
  checked_in_at: string;
  expires_at: string;
  last_verified_at: string;
  is_active: boolean;
}

export interface Anchorage {
  id: string;
  name: string;
  island: string;
  lat: number;
  lng: number;
  distance?: number;
  checkinCount?: number;
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    display_name: string;
    vessel_name?: string;
    boat_name?: string;
    avatar_url?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
}
