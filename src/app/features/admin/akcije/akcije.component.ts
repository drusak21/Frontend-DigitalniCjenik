import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AkcijeService } from '../../../core/services/akcije.service';
import { ObjektiService } from '../../../core/services/objekti.service';
import { ArtikliService } from '../../../core/services/artikli.service';
import { Akcija, CreateAkcijaDTO } from '../../../core/models/akcija.model';
import { Objekt } from '../../../core/models/objekt.model';
import { Artikl } from '../../../core/models/artikl.model';

@Component({
  selector: 'app-akcije',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './akcije.component.html',
  styleUrls: ['./akcije.component.scss']
})
export class AkcijeComponent implements OnInit {
  akcije: Akcija[] = [];
  objekti: Objekt[] = [];
  artikli: Artikl[] = [];
  
  // Za novu akciju
  novaAkcija: CreateAkcijaDTO = {
    naziv: '',
    opis: '',
    vrsta: 'lokalna',
    datumPocetka: '',
    datumZavrsetka: '',
    slika: '',
    objektID: 0,
    artiklID: undefined
  };

  // Za edit
  editAkcija: Akcija | null = null;
  editData: any = {
    naziv: '',
    opis: '',
    vrsta: 'lokalna',
    datumPocetka: '',
    datumZavrsetka: '',
    slika: '',
    objektID: 0,
    artiklID: undefined
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  prikaziFormu = false;
  searchTerm = '';
  filterVrsta: string = '';
  filterAktivna: string = '';

  constructor(
    private akcijeService: AkcijeService,
    private objektiService: ObjektiService,
    private artikliService: ArtikliService
  ) {}

  ngOnInit(): void {
    this.ucitajObjekte();
    this.ucitajArtikle();
    this.ucitajAkcije();
  }

  ucitajObjekte(): void {
    this.objektiService.getSviObjekti().subscribe({
      next: (data) => {
        this.objekti = data;
      },
      error: (error) => {
        console.error('Greška pri učitavanju objekata:', error);
      }
    });
  }

  ucitajArtikle(): void {
    this.artikliService.getSviArtikli().subscribe({
      next: (data) => {
        this.artikli = data;
      },
      error: (error) => {
        console.error('Greška pri učitavanju artikala:', error);
      }
    });
  }

  ucitajAkcije(): void {
    this.loading = true;
    this.akcijeService.getSveAkcije().subscribe({
      next: (data) => {
        this.akcije = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Greška pri učitavanju akcija';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  dodajAkciju(): void {
    if (!this.novaAkcija.naziv || !this.novaAkcija.objektID) {
      this.errorMessage = 'Naziv i objekt su obavezni';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    this.akcijeService.createAkcija(this.novaAkcija).subscribe({
      next: (akcija) => {
        this.akcije.push(akcija);
        this.resetFormu();
        this.successMessage = 'Akcija uspješno dodana';
        this.loading = false;
        this.prikaziFormu = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri dodavanju akcije';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  urediAkciju(akcija: Akcija): void {
    this.editAkcija = akcija;
    this.editData = {
      naziv: akcija.naziv,
      opis: akcija.opis || '',
      vrsta: akcija.vrsta,
      datumPocetka: akcija.datumPocetka || '',
      datumZavrsetka: akcija.datumZavrsetka || '',
      slika: akcija.slika || '',
      objektID: akcija.objektID,
      artiklID: akcija.artiklID || undefined
    };
  }

  spremiIzmjene(): void {
    if (!this.editAkcija) return;

    this.loading = true;
    
    this.akcijeService.updateAkcija(this.editAkcija.id, {
      naziv: this.editData.naziv,
      opis: this.editData.opis,
      vrsta: this.editData.vrsta,
      datumPocetka: this.editData.datumPocetka,
      datumZavrsetka: this.editData.datumZavrsetka,
      slika: this.editData.slika,
      objektID: this.editData.objektID,
      artiklID: this.editData.artiklID || undefined
    }).subscribe({
      next: (response) => {
        this.ucitajAkcije();
        this.editAkcija = null;
        this.successMessage = 'Akcija uspješno ažurirana';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri ažuriranju akcije';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  obrisiAkciju(id: number): void {
    if (confirm('Jeste li sigurni da želite obrisati ovu akciju?')) {
      this.loading = true;
      this.akcijeService.deleteAkcija(id).subscribe({
        next: () => {
          this.akcije = this.akcije.filter(a => a.id !== id);
          this.successMessage = 'Akcija uspješno obrisana';
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Greška pri brisanju akcije';
          this.loading = false;
          console.error('Greška:', error);
        }
      });
    }
  }

  toggleAktivnost(akcija: Akcija): void {
  this.loading = true;
  const novaVrijednost = !akcija.aktivna;
  
  this.akcijeService.aktivirajAkciju(akcija.id, novaVrijednost).subscribe({
    next: (response) => {
      console.log('Odgovor:', response);
      akcija.aktivna = novaVrijednost;
      this.successMessage = `Akcija ${novaVrijednost ? 'aktivirana' : 'deaktivirana'}`;
      this.loading = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      console.error('Greška:', error);
      this.errorMessage = 'Greška pri promjeni statusa';
      this.loading = false;
    }
  });
}

  getNazivObjekta(id: number): string {
    const obj = this.objekti.find(o => o.id === id);
    return obj ? obj.naziv : 'Nepoznato';
  }

  getNazivArtikla(id: number | null | undefined): string {
    if (!id) return '-';
    const art = this.artikli.find(a => a.id === id);
    return art ? art.naziv : 'Nepoznato';
  }

  resetFormu(): void {
    this.novaAkcija = {
      naziv: '',
      opis: '',
      vrsta: 'lokalna',
      datumPocetka: '',
      datumZavrsetka: '',
      slika: '',
      objektID: 0,
      artiklID: undefined
    };
    this.editAkcija = null;
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editAkcija = null;
    this.editData = {};
  }

  get filtriraneAkcije(): Akcija[] {
    let filtrirano = this.akcije;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtrirano = filtrirano.filter(a => 
        a.naziv.toLowerCase().includes(term) ||
        a.opis?.toLowerCase().includes(term) ||
        this.getNazivObjekta(a.objektID).toLowerCase().includes(term)
      );
    }
    
    if (this.filterVrsta) {
      filtrirano = filtrirano.filter(a => a.vrsta === this.filterVrsta);
    }
    
    if (this.filterAktivna === 'aktivna') {
      filtrirano = filtrirano.filter(a => a.aktivna);
    } else if (this.filterAktivna === 'neaktivna') {
      filtrirano = filtrirano.filter(a => !a.aktivna);
    }
    
    return filtrirano;
  }
}