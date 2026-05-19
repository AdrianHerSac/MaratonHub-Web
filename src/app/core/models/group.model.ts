export interface Group {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  inviteCode?: string;
  members: GroupMember[];
  memberCount: number;
}

export interface GroupSummary {
  id: string;
  name: string;
  description?: string;
  createdByName: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  userName: string;
  role: 'Admin' | 'Member';
  joinedAt: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

export interface JoinGroupDto {
  inviteCode: string;
}

export interface GroupRating {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  mediaId: number;
  mediaType: string;
  mediaTitle: string;
  posterPath?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateGroupRatingDto {
  mediaId: number;
  mediaType: string;
  mediaTitle: string;
  posterPath?: string;
  rating: number;
  comment?: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  message: string;
  sentAt: string;
}

export interface NotificationModel {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  groupId?: string;
  read: boolean;
  createdAt: string;
}
