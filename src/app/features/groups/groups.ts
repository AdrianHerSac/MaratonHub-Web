import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GroupService } from '../../core/services/group.service';
import { AuthService } from '../../core/services/auth.service';
import { GroupSummary, CreateGroupDto, JoinGroupDto } from '../../core/models/group.model';

@Component({
  selector: 'app-groups',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class GroupsComponent implements OnInit {
  groups: GroupSummary[] = [];
  loading = true;
  error = '';

  // Create group modal
  showCreateModal = false;
  createDto: CreateGroupDto = { name: '', description: '' };
  createError = '';
  creating = false;

  // Join group
  showJoinModal = false;
  inviteCode = '';
  joinError = '';
  joinSuccess = '';
  joining = false;

  // Search
  searchQuery = '';
  searchResults: GroupSummary[] = [];
  searching = false;

  constructor(
    public groupService: GroupService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupService.getMyGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar grupos';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.createDto = { name: '', description: '' };
    this.createError = '';
  }

  createGroup(): void {
    if (!this.createDto.name.trim()) {
      this.createError = 'El nombre del grupo es obligatorio';
      return;
    }
    this.creating = true;
    this.createError = '';
    this.groupService.createGroup(this.createDto).subscribe({
      next: () => {
        this.creating = false;
        this.showCreateModal = false;
        this.loadGroups();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.creating = false;
        this.createError = err.error || err.message || 'Error al crear el grupo';
        console.error('Error creating group:', err);
        this.cdr.detectChanges();
      }
    });
  }

  openJoinModal(): void {
    this.showJoinModal = true;
    this.inviteCode = '';
    this.joinError = '';
    this.joinSuccess = '';
  }

  joinGroup(): void {
    if (!this.inviteCode.trim()) {
      this.joinError = 'Introduce un código de invitación';
      return;
    }
    this.joining = true;
    this.joinError = '';
    this.joinSuccess = '';
    
    this.groupService.joinGroupByCode(this.inviteCode.trim()).subscribe({
      next: (response) => {
        this.joining = false;
        this.joinSuccess = response.message;
        this.loadGroups();
        // Cerrar modal después de unirse con éxito
        setTimeout(() => {
          this.showJoinModal = false;
          this.cdr.detectChanges();
        }, 1500);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.joining = false;
        this.joinError = err.error || err.message || 'Error al unirse al grupo';
        this.cdr.detectChanges();
      }
    });
  }

  searchGroups(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.searching = true;
    this.groupService.searchGroups(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.searching = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.searching = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteGroup(id: string, event: Event): void {
    event.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar este grupo?')) return;
    this.groupService.deleteGroup(id).subscribe({
      next: () => this.loadGroups()
    });
  }
}
