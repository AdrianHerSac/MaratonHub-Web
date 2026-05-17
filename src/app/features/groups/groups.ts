import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TmdbApiService } from '../../core/services/tmdb-api.service';
import { ReviewService } from '../../core/services/review.service';

@Component({
  selector: 'app-groups',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen text-white pt-24 pb-12 px-4 flex items-center justify-center">
      <div class="text-center">
        <p style="font-size:3rem">👥</p>
        <h1 style="font-size:2rem;font-weight:800;margin:1rem 0">Grupos</h1>
        <p style="opacity:0.6">La funcionalidad de grupos estará disponible próximamente.</p>
      </div>
    </div>
  `
})
export class GroupsComponent {}
