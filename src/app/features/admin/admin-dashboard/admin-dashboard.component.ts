import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  
  menuItems = [
    { path: '/admin/korisnici', icon: '👥', label: 'Korisnici' },
    { path: '/admin/objekti', icon: '🏢', label: 'Objekti' },
    { path: '/admin/ugostitelji', icon: '👨‍🍳', label: 'Ugostitelji' },
    { path: '/admin/artikli', icon: '🍽️', label: 'Artikli' },
    { path: '/admin/kategorije', icon: '📑', label: 'Kategorije' },
    { path: '/admin/akcije', icon: '🏷️', label: 'Akcije' },
    { path: '/admin/banneri', icon: '🖼️', label: 'Banneri' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/cjenik/default']);
  }
}