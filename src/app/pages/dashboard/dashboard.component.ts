import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  korisnikIme: string = '';
  korisnikUloga: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.korisnikIme = localStorage.getItem('korisnikIme') || '';
    this.korisnikUloga = localStorage.getItem('korisnikUloga') || '';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnikIme');
    localStorage.removeItem('korisnikUloga');
    this.router.navigate(['/login']);
  }
}