import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-group-detail',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen text-white pt-24 pb-12 px-4 flex items-center justify-center">
      <div class="text-center">
        <p style="font-size:3rem">👥</p>
        <h1 style="font-size:2rem;font-weight:800;margin:1rem 0">Detalle del Grupo</h1>
        <p style="opacity:0.6">La funcionalidad de grupos estará disponible próximamente.</p>
      </div>
    </div>
  `
})
export class GroupDetailComponent {}
