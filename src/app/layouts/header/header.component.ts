import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userIme = '';
  userUloga = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.userIme = localStorage.getItem('userIme') || 'Korisnik';
      this.userUloga = localStorage.getItem('userUloga') || '';
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userIme');
    localStorage.removeItem('userUloga');
    this.router.navigate(['/login']);
  }
}