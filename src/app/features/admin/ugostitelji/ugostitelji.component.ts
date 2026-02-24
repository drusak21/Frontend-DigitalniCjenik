import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UgostiteljiService } from '../../../core/services/ugostitelji.service';
import { KorisniciService } from '../../../core/services/korisnici.service';
import { Ugostitelj, CreateUgostiteljDTO } from '../../../core/models/ugostitelj.model';
import { Korisnik } from '../../../core/models/korisnik.model';

@Component({
  selector: 'app-ugostitelji',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ugostitelji.component.html',
  styleUrls: ['./ugostitelji.component.scss']
})
export class UgostiteljiComponent implements OnInit {
  ugostitelji: Ugostitelj[] = [];
  korisnici: Korisnik[] = [];
  
  // Za novog ugostitelja
  noviUgostitelj: CreateUgostiteljDTO = {
    naziv: '',
    kontaktEmail: '',
    kontaktTelefon: '',
    oib: '',
    logotip: '',
    brandingBoje: '',
    korisnikId: 0
  };

  // Za edit
  editUgostitelj: Ugostitelj | null = null;
  editData: any = {
    naziv: '',
    kontaktEmail: '',
    kontaktTelefon: '',
    oib: '',
    logotip: '',
    brandingBoje: '',
    korisnikId: 0
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  prikaziFormu = false;
  searchTerm = '';

  constructor(
    private ugostiteljiService: UgostiteljiService,
    private korisniciService: KorisniciService
  ) {}

  ngOnInit(): void {
    this.ucitajKorisnike();
    this.ucitajUgostitelje();
  }

  ucitajUgostitelje(): void {
  this.loading = true;
  this.ugostiteljiService.getSviUgostitelji().subscribe({
    next: (data) => {
      console.log('Backend podaci:', data);
      

      this.ugostitelji = data.map((ug: any) => {
        const korisnikId = ug.korisnikID;
        
        const korisnik = this.korisnici.find(k => k.id === korisnikId);
        
        return {
          id: ug.id,
          naziv: ug.naziv,
          oib: ug.oib,
          kontaktEmail: ug.kontaktEmail,
          kontaktTelefon: ug.kontaktTelefon,
          logotip: ug.logotip,
          brandingBoje: ug.brandingBoje,
          korisnikId: korisnikId,  
          korisnikID: korisnikId,
          imePrezime: korisnik ? korisnik.imePrezime : 'Nepoznato'
        };
      });
      
      console.log('Spojeni podaci:', this.ugostitelji);
      this.loading = false;
    },
    error: (error) => {
      this.errorMessage = 'Greška pri učitavanju ugostitelja';
      this.loading = false;
      console.error('Greška:', error);
    }
  });
}

  ucitajKorisnike(): void {
    this.korisniciService.getKorisnici().subscribe({
      next: (data) => {
        this.korisnici = data.filter(k => k.ulogaNaziv === 'Ugostitelj');
      },
      error: (error) => {
        console.error('Greška pri učitavanju korisnika:', error);
      }
    });
  }

  dodajUgostitelja(): void {
  if (!this.noviUgostitelj.naziv) {
    this.errorMessage = 'Naziv je obavezan';
    return;
  }

  if (this.noviUgostitelj.korisnikId === 0) {
    this.errorMessage = 'Odaberite korisnika';
    return;
  }

  this.loading = true;
  this.errorMessage = '';
  
  this.ugostiteljiService.createUgostitelj(this.noviUgostitelj).subscribe({
    next: (response) => {
      console.log('Ugostitelj kreiran:', response);
      
      // Osvježi listu ugostitelja
      this.ucitajUgostitelje();
      
      this.resetFormu();
      this.successMessage = 'Ugostitelj uspješno dodan';
      this.loading = false;
      this.prikaziFormu = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      this.errorMessage = 'Greška pri dodavanju ugostitelja';
      this.loading = false;
      console.error('Greška:', error);
    }
  });
}

  urediUgostitelja(ugostitelj: Ugostitelj): void {
    this.editUgostitelj = ugostitelj;
    this.editData = {
      naziv: ugostitelj.naziv,
      kontaktEmail: ugostitelj.kontaktEmail || '',
      kontaktTelefon: ugostitelj.kontaktTelefon || '',
      oib: ugostitelj.oib || '',
      logotip: ugostitelj.logotip || '',
      brandingBoje: ugostitelj.brandingBoje || '',
      korisnikId: ugostitelj.korisnikId
    };
  }

  spremiIzmjene(): void {
  if (!this.editUgostitelj) return;

  this.loading = true;
  
  this.ugostiteljiService.updateUgostitelj(this.editUgostitelj.id, {
    naziv: this.editData.naziv,
    kontaktEmail: this.editData.kontaktEmail,
    kontaktTelefon: this.editData.kontaktTelefon,
    oib: this.editData.oib,
    logotip: this.editData.logotip,
    brandingBoje: this.editData.brandingBoje,
    korisnikId: this.editData.korisnikId
  }).subscribe({
    next: (response) => {
      console.log('Update response:', response);
      this.ucitajUgostitelje();
      this.editUgostitelj = null;
      this.successMessage = 'Ugostitelj uspješno ažuriran';
      this.loading = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      this.errorMessage = 'Greška pri ažuriranju ugostitelja';
      this.loading = false;
      console.error('Greška:', error);
    }
  });
}

  obrisiUgostitelja(id: number): void {
  if (confirm('Jeste li sigurni da želite obrisati ovog ugostitelja?')) {
    this.loading = true;
    this.ugostiteljiService.deleteUgostitelj(id).subscribe({
      next: (response) => {
        console.log('Delete response:', response);
        this.ugostitelji = this.ugostitelji.filter(u => u.id !== id);
        this.successMessage = 'Ugostitelj uspješno obrisan';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri brisanju ugostitelja';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }
}

  getKorisnikIme(ugostitelj: any): string {
  const korisnikId = ugostitelj.korisnikID;
  
  if (!korisnikId) return 'Nepoznato';
  
  const korisnik = this.korisnici.find(k => k.id === korisnikId);
  return korisnik ? korisnik.imePrezime : 'Nepoznato';
}

  resetFormu(): void {
    this.noviUgostitelj = {
      naziv: '',
      kontaktEmail: '',
      kontaktTelefon: '',
      oib: '',
      logotip: '',
      brandingBoje: '',
      korisnikId: 0
    };
    this.editUgostitelj = null;
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editUgostitelj = null;
    this.editData = {};
  }

  get filtriraniUgostitelji(): Ugostitelj[] {
    if (!this.searchTerm) return this.ugostitelji;
    const term = this.searchTerm.toLowerCase();
    return this.ugostitelji.filter(u => 
      u.naziv.toLowerCase().includes(term) ||
      u.kontaktEmail?.toLowerCase().includes(term) ||
      u.kontaktTelefon?.includes(term)
    );
  }
}