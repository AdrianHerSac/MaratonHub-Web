import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, UserManagementInfo } from '../../../core/services/admin.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  users: UserManagementInfo[] = [];
  loading = true;
  searchTerm = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting user', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleRole(user: UserManagementInfo): void {
    const newRole = user.role === 'Admin' ? 'User' : 'Admin';
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating role', err);
        this.cdr.detectChanges();
      }
    });
  }

  get filteredUsers(): UserManagementInfo[] {
    return this.users.filter(u =>
      u.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
