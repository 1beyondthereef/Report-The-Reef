// Shared types for social features

export interface BaseUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  boatName: string | null;
  homePort: string | null;
  bio: string | null;
}

export interface OnlineUser extends BaseUser {
  latitude: number;
  longitude: number;
  isOnline: boolean;
  isCurrentUser: boolean;
}

export interface Conversation {
  user: BaseUser;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  isRead: boolean;
}
