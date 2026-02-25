import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KategorijeService } from '../../../core/services/kategorije.service';
import { Kategorija, CreateKategorijaDTO } from '../../../core/models/kategorija.model';

@Component({
  selector: 'app-kategorije',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kategorije.component.html',
  styleUrls: ['./kategorije.component.scss']
})
export class KategorijeComponent implements OnInit {
  kategorije: Kategorija[] = [];
  
  // Za novu kategoriju
  novaKategorija: CreateKategorijaDTO = {
    naziv: '',
    redoslijedPrikaza: 1,
    aktivan: true
  };

  // Za edit
  editKategorija: Kategorija | null = null;
  editData: any = {
    naziv: '',
    redoslijedPrikaza: 1,
    aktivan: true
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  prikaziFormu = false;
  searchTerm = '';

  constructor(private kategorijeService: KategorijeService) {}

  ngOnInit(): void {
    this.ucitajKategorije();
  }

  ucitajKategorije(): void {
    this.loading = true;
    this.kategorijeService.getSveKategorije().subscribe({
      next: (data) => {
        this.kategorije = data.sort((a, b) => a.redoslijedPrikaza - b.redoslijedPrikaza);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Greška pri učitavanju kategorija';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  dodajKategoriju(): void {
    if (!this.novaKategorija.naziv) {
      this.errorMessage = 'Naziv je obavezan';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    this.kategorijeService.createKategorija(this.novaKategorija).subscribe({
      next: (kategorija) => {
        this.kategorije.push(kategorija);
        this.kategorije.sort((a, b) => a.redoslijedPrikaza - b.redoslijedPrikaza);
        this.resetFormu();
        this.successMessage = 'Kategorija uspješno dodana';
        this.loading = false;
        this.prikaziFormu = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri dodavanju kategorije';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  urediKategoriju(kategorija: Kategorija): void {
    this.editKategorija = kategorija;
    this.editData = {
      naziv: kategorija.naziv,
      redoslijedPrikaza: kategorija.redoslijedPrikaza,
      aktivan: kategorija.aktivan
    };
  }

  spremiIzmjene(): void {
    if (!this.editKategorija) return;

    this.loading = true;
    
    this.kategorijeService.updateKategorija(this.editKategorija.id, {
      naziv: this.editData.naziv,
      redoslijedPrikaza: this.editData.redoslijedPrikaza,
      aktivan: this.editData.aktivan
    }).subscribe({
      next: (response) => {
        this.ucitajKategorije();
        this.editKategorija = null;
        this.successMessage = 'Kategorija uspješno ažurirana';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri ažuriranju kategorije';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  obrisiKategoriju(id: number): void {
    if (confirm('Jeste li sigurni da želite obrisati ovu kategoriju?')) {
      this.loading = true;
      this.kategorijeService.deleteKategorija(id).subscribe({
        next: () => {
          this.kategorije = this.kategorije.filter(k => k.id !== id);
          this.successMessage = 'Kategorija uspješno obrisana';
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Greška pri brisanju kategorije';
          this.loading = false;
          console.error('Greška:', error);
        }
      });
    }
  }

  pomakniGore(index: number): void {
    if (index === 0) return;
    
    const temp = this.kategorije[index];
    this.kategorije[index] = this.kategorije[index - 1];
    this.kategorije[index - 1] = temp;
    
  }

  pomakniDolje(index: number): void {
    if (index === this.kategorije.length - 1) return;
    
    const temp = this.kategorije[index];
    this.kategorije[index] = this.kategorije[index + 1];
    this.kategorije[index + 1] = temp;
    

  }


  resetFormu(): void {
    this.novaKategorija = {
      naziv: '',
      redoslijedPrikaza: this.kategorije.length + 1,
      aktivan: true
    };
    this.editKategorija = null;
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editKategorija = null;
    this.editData = {};
  }

  get filtriraneKategorije(): Kategorija[] {
    if (!this.searchTerm) return this.kategorije;
    const term = this.searchTerm.toLowerCase();
    return this.kategorije.filter(k => 
      k.naziv.toLowerCase().includes(term)
    );
  }
}