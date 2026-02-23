import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KorisniciService } from '../../../core/services/korisnici.service';
import { Korisnik, Uloga, CreateKorisnikRequest } from '../../../core/models/korisnik.model';

@Component({
  selector: 'app-korisnici',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './korisnici.component.html',
  styleUrls: ['./korisnici.component.scss']
})
export class KorisniciComponent implements OnInit {
  korisnici: Korisnik[] = [];
  uloge: Uloga[] = [];
  
  noviKorisnik: CreateKorisnikRequest = {
    imePrezime: '',
    email: '',
    lozinka: '',
    ulogaID: 3,  // 3 je Putnik (iz backend loga)
    jezikSucelja: 'HR'
  };

  editKorisnik: Korisnik | null = null;
  editData: any = {
    imePrezime: '',
    email: '',
    ulogaID: 3,
    jezikSucelja: 'HR'
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  prikaziFormu = false;
  searchTerm = '';

  constructor(private korisniciService: KorisniciService) {}

  ngOnInit(): void {
    this.ucitajUloge();
  }

  ucitajUloge(): void {
    this.korisniciService.getUloge().subscribe({
      next: (data: Uloga[]) => {
        this.uloge = data;
        console.log('Uloge učitane:', this.uloge);
        this.ucitajKorisnike();
      },
      error: (error: any) => {
        console.error('Greška pri učitavanju uloga:', error);
        this.ucitajKorisnike();
      }
    });
  }

  ucitajKorisnike(): void {
    this.loading = true;
    this.korisniciService.getKorisnici().subscribe({
      next: (data: Korisnik[]) => {
        console.log('Korisnici učitani:', data);
        this.korisnici = data;
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Greška pri učitavanju korisnika';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  dodajKorisnika(): void {
  if (!this.noviKorisnik.imePrezime || !this.noviKorisnik.email) {
    this.errorMessage = 'Ime i prezime i email su obavezni';
    return;
  }

  this.loading = true;
  this.errorMessage = '';
  
  this.korisniciService.createKorisnik(this.noviKorisnik).subscribe({
    next: (response) => {
      console.log('Korisnik kreiran:', response);
      
      // Osvježi listu korisnika
      this.ucitajKorisnike();
      
      this.resetFormu();
      this.successMessage = 'Korisnik uspješno dodan';
      this.loading = false;
      this.prikaziFormu = false;
      
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error: any) => {
      this.errorMessage = 'Greška pri dodavanju korisnika';
      this.loading = false;
      console.error('Greška:', error);
    }
  });
}

  urediKorisnika(korisnik: Korisnik): void {
    const uloga = this.uloge.find(u => u.naziv === korisnik.ulogaNaziv);
    
    this.editKorisnik = korisnik;
    this.editData = {
      imePrezime: korisnik.imePrezime,
      email: korisnik.email,
      ulogaID: uloga ? uloga.id : 3, 
      jezikSucelja: korisnik.jezikSucelja || 'HR'
    };
  }

  spremiIzmjene(): void {
    if (!this.editKorisnik) return;

    this.loading = true;
    
    this.korisniciService.updateKorisnik(this.editKorisnik.id, {
      imePrezime: this.editData.imePrezime,
      email: this.editData.email,
      ulogaID: this.editData.ulogaID,
      jezikSucelja: this.editData.jezikSucelja
    }).subscribe({
      next: (updatedKorisnik: Korisnik) => {
        // Osvježi listu korisnika
        this.ucitajKorisnike();
        this.editKorisnik = null;
        this.successMessage = 'Korisnik uspješno ažuriran';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.errorMessage = 'Greška pri ažuriranju korisnika';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  deaktivirajKorisnika(id: number): void {
  if (confirm('Jeste li sigurni da želite deaktivirati ovog korisnika?')) {
    this.loading = true;
    this.korisniciService.deaktivirajKorisnika(id).subscribe({
      next: (response) => {
        console.log('Deaktivacija uspješna:', response);
        this.ucitajKorisnike();
        this.successMessage = 'Korisnik deaktiviran';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.errorMessage = 'Greška pri deaktivaciji';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }
}

  aktivirajKorisnika(id: number): void {
    this.loading = true;
    this.korisniciService.aktivirajKorisnika(id).subscribe({
      next: () => {
        this.ucitajKorisnike();
        this.successMessage = 'Korisnik aktiviran';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.errorMessage = 'Greška pri aktivaciji';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  resetFormu(): void {
    this.noviKorisnik = {
      imePrezime: '',
      email: '',
      lozinka: '',
      ulogaID: 3,
      jezikSucelja: 'HR'
    };
    this.editKorisnik = null;
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editKorisnik = null;
    this.editData = {};
  }

  // Jednostavno - samo vrati ulogaNaziv iz korisnika
  getNazivUloge(ulogaNaziv: string): string {
    return ulogaNaziv || 'Nepoznato';
  }

  // Za prikaz u select dropdown-u
  getUlogaNazivIzId(ulogaId: number): string {
    const uloga = this.uloge.find(u => u.id === ulogaId);
    return uloga ? uloga.naziv : 'Nepoznato';
  }

  get filtriraniKorisnici(): Korisnik[] {
    if (!this.searchTerm) return this.korisnici;
    return this.korisnici.filter(k => 
      k.imePrezime.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      k.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      k.ulogaNaziv.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}