import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  email = '';
  lozinka = '';
  poruka = '';
  returnUrl = '/';  // Default na početnu

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Dohvati returnUrl iz query parametara (ako postoji)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login() {

    if (this.email === 'test@test.com' && this.lozinka === '123') {
      // Spremi token u localStorage
      localStorage.setItem('token', 'test-token-123');
      localStorage.setItem('korisnikIme', 'Test Korisnik');
      localStorage.setItem('korisnikUloga', 'Administrator');
      
      // Preusmjeri na originalnu rutu koju je pokušao otvoriti
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.poruka = 'Pogrešan email ili lozinka';
    }
  }
}