import { Injectable, NgZone, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ChatMessage, NotificationModel } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {
  private hubConnection?: signalR.HubConnection;
  private messageSubject = new Subject<ChatMessage>();
  private notificationSubject = new Subject<NotificationModel>();
  private unreadCountSubject = new Subject<number>();
  private connectedSubject = new Subject<boolean>();

  public onMessage = this.messageSubject.asObservable();
  public onNotification = this.notificationSubject.asObservable();
  public onUnreadCount = this.unreadCountSubject.asObservable();
  public onConnected = this.connectedSubject.asObservable();

  constructor(private authService: AuthService, private zone: NgZone) {}

  start(): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) return;

    const token = this.authService.getToken();
    if (!token) return;

    const baseUrl = environment.apiUrl.replace('/api', '');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/chat`, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      this.zone.run(() => this.messageSubject.next(message));
    });

    this.hubConnection.start()
      .then(() => this.connectedSubject.next(true))
      .catch(() => {});

    this.setupNotificationHub(token, baseUrl);
  }

  private setupNotificationHub(token: string, baseUrl: string): void {
    const notificationHub = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/notifications`, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    notificationHub.on('ReceiveNotification', (notification: NotificationModel) => {
      this.zone.run(() => this.notificationSubject.next(notification));
    });

    notificationHub.on('UnreadCount', (count: number) => {
      this.zone.run(() => this.unreadCountSubject.next(count));
    });

    notificationHub.start().catch(() => {});
  }

  async joinGroup(groupId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinGroup', groupId);
    }
  }

  async leaveGroup(groupId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveGroup', groupId);
    }
  }

  async sendMessage(groupId: string, message: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('SendMessage', groupId, message);
    }
  }

  stop(): void {
    this.hubConnection?.stop();
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
