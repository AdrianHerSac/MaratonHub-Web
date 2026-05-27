import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Group, GroupSummary, CreateGroupDto, UpdateGroupDto, JoinGroupDto,
  GroupRating, CreateGroupRatingDto, ChatMessage
} from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private apiUrl = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) {}

  getMyGroups(): Observable<GroupSummary[]> {
    return this.http.get<GroupSummary[]>(this.apiUrl);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  createGroup(dto: CreateGroupDto): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, dto);
  }

  updateGroup(id: string, dto: UpdateGroupDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  joinGroup(id: string, dto: JoinGroupDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/join`, dto);
  }

  joinGroupByCode(inviteCode: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/join/${inviteCode}`, {});
  }

  generateInviteCode(id: string): Observable<{ inviteCode: string }> {
    return this.http.post<{ inviteCode: string }>(`${this.apiUrl}/${id}/generate-invite`, {});
  }

  leaveGroup(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/leave`, {});
  }

  promoteMember(groupId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${groupId}/members/${userId}/promote`, {});
  }

  removeMember(groupId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}/members/${userId}`);
  }

  getGroupRatings(id: string): Observable<GroupRating[]> {
    return this.http.get<GroupRating[]>(`${this.apiUrl}/${id}/ratings`);
  }

  createGroupRating(id: string, dto: CreateGroupRatingDto): Observable<GroupRating> {
    return this.http.post<GroupRating>(`${this.apiUrl}/${id}/ratings`, dto);
  }

  deleteGroupRating(id: string, ratingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/ratings/${ratingId}`);
  }

  getGroupAverageRating(id: string, mediaType: string, mediaId: number): Observable<{ averageRating: number; totalRatings: number }> {
    return this.http.get<{ averageRating: number; totalRatings: number }>(`${this.apiUrl}/${id}/ratings/average/${mediaType}/${mediaId}`);
  }

  getChatMessages(id: string, limit = 50): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${id}/chat`, { params: { limit } });
  }

  searchGroups(q: string): Observable<GroupSummary[]> {
    return this.http.get<GroupSummary[]>(`${this.apiUrl}/search`, { params: { q } });
  }
}
