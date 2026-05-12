import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);

  activeTab: 'profile' | 'settings' = 'profile';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'settings') {
        this.activeTab = 'settings';
      } else {
        this.activeTab = 'profile';
      }
    });
  }

  setTab(tab: 'profile' | 'settings') {
    this.activeTab = tab;
  }
}
