import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  lozinka: string = '';
  poruka: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.lozinka) {
      this.poruka = 'Molimo unesite email i lozinku';
      return;
    }

    this.loading = true;
    this.poruka = '';

    this.authService.login({
      email: this.email,
      lozinka: this.lozinka
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.uloga === 'Administrator') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        this.poruka = 'Neispravan email ili lozinka';
      }
    });
  }
}