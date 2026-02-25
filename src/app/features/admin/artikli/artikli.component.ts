import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtikliService } from '../../../core/services/artikli.service';
import { KategorijeService } from '../../../core/services/kategorije.service';
import { Artikl, CreateArtiklDTO } from '../../../core/models/artikl.model';
import { Kategorija } from '../../../core/services/kategorije.service';

@Component({
  selector: 'app-artikli',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './artikli.component.html',
  styleUrls: ['./artikli.component.scss']
})
export class ArtikliComponent implements OnInit {
  artikli: Artikl[] = [];
  kategorije: Kategorija[] = [];
  
  // Za novi artikl
  noviArtikl: CreateArtiklDTO = {
    naziv: '',
    opis: '',
    cijena: 0,
    sastavAlergeni: '',
    slika: '',
    brand: 'Ostalo',
    zakljucan: false,
    kategorijaID: 0
  };

  // Za edit
  editArtikl: Artikl | null = null;
  editData: any = {
    naziv: '',
    opis: '',
    cijena: 0,
    sastavAlergeni: '',
    slika: '',
    brand: 'Ostalo',
    zakljucan: false,
    kategorijaId: 0
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  prikaziFormu = false;
  searchTerm = '';
  filterKategorija: number = 0;

  constructor(
    private artikliService: ArtikliService,
    private kategorijeService: KategorijeService
  ) {}

  ngOnInit(): void {
    this.ucitajKategorije();
    this.ucitajArtikle();
  }

  ucitajKategorije(): void {
    this.kategorijeService.getSveKategorije().subscribe({
      next: (data) => {
        this.kategorije = data;
      },
      error: (error) => {
        console.error('Greška pri učitavanju kategorija:', error);
      }
    });
  }

  ucitajArtikle(): void {
    this.loading = true;
    this.artikliService.getSviArtikli().subscribe({
      next: (data) => {
        this.artikli = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Greška pri učitavanju artikala';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  dodajArtikl(): void {
  if (!this.noviArtikl.naziv || this.noviArtikl.cijena <= 0) {
    this.errorMessage = 'Naziv i cijena su obavezni';
    return;
  }

  if (this.noviArtikl.kategorijaID === 0) {
    this.errorMessage = 'Odaberite kategoriju';
    return;
  }

  this.loading = true;
  this.errorMessage = '';
  
  this.artikliService.createArtikl(this.noviArtikl).subscribe({
    next: (artikl) => {
      this.ucitajArtikle();
      
      this.resetFormu();
      this.successMessage = 'Artikl uspješno dodan';
      this.loading = false;
      this.prikaziFormu = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      this.errorMessage = 'Greška pri dodavanju artikla';
      this.loading = false;
      console.error('Greška:', error);
    }
  });
}

  urediArtikl(artikl: Artikl): void {
    this.editArtikl = artikl;
    this.editData = {
      naziv: artikl.naziv,
      opis: artikl.opis || '',
      cijena: artikl.cijena,
      sastavAlergeni: artikl.sastavAlergeni || '',
      slika: artikl.slika || '',
      brand: artikl.brand,
      zakljucan: artikl.zakljucan,
      kategorijaID: artikl.kategorijaID
    };
  }

  spremiIzmjene(): void {
  if (!this.editArtikl) return;

  this.loading = true;
  
  this.artikliService.updateArtikl(this.editArtikl.id, {
    naziv: this.editData.naziv,
    opis: this.editData.opis,
    cijena: this.editData.cijena,
    sastavAlergeni: this.editData.sastavAlergeni,
    slika: this.editData.slika,
    brand: this.editData.brand,
    zakljucan: this.editData.zakljucan,
    kategorijaID: this.editData.kategorijaId
  }).subscribe({
    next: (response) => {
      this.ucitajArtikle();  // ← PONOVO UČITAJ
      this.editArtikl = null;
      this.successMessage = 'Artikl uspješno ažuriran';
      this.loading = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      this.errorMessage = 'Greška pri ažuriranju artikla';
      this.loading = false;
      console.error('Greška:', error);
    }
  });
}

  obrisiArtikl(id: number): void {
  if (confirm('Jeste li sigurni da želite obrisati ovaj artikl?')) {
    this.loading = true;
    this.artikliService.deleteArtikl(id).subscribe({
      next: () => {
        this.ucitajArtikle(); 
        this.successMessage = 'Artikl uspješno obrisan';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri brisanju artikla';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }
}

  getNazivKategorije(kategorijaId: number): string {
    const kat = this.kategorije.find(k => k.id === kategorijaId);
    return kat ? kat.naziv : 'Nepoznato';
  }

  getBrandClass(brand: string): string {
    return brand === 'PanonskiIzvori' ? 'brand-panonski' : 'brand-ostalo';
  }

  resetFormu(): void {
    this.noviArtikl = {
      naziv: '',
      opis: '',
      cijena: 0,
      sastavAlergeni: '',
      slika: '',
      brand: 'Ostalo',
      zakljucan: false,
      kategorijaID: 0
    };
    this.editArtikl = null;
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editArtikl = null;
    this.editData = {};
  }

  get filtriraniArtikli(): Artikl[] {
  let filtrirano = this.artikli;
  

  if (this.filterKategorija && this.filterKategorija > 0) {
    const filterValue = Number(this.filterKategorija); 
    console.log('Filter value (number):', filterValue);
    
    filtrirano = this.artikli.filter(a => {
      const katId = Number(a.kategorijaID); 
      return katId === filterValue;
    });
    
    console.log('Filtrirano:', filtrirano);
  }
  
  if (this.searchTerm && this.searchTerm.trim() !== '') {
    const term = this.searchTerm.toLowerCase().trim();
    filtrirano = filtrirano.filter(a => 
      a.naziv.toLowerCase().includes(term) ||
      (a.opis && a.opis.toLowerCase().includes(term)) ||
      this.getNazivKategorije(a.kategorijaID).toLowerCase().includes(term)
    );
  }
  
  return filtrirano;
}

  // Za CSV import
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.artikliService.importArtikli(file).subscribe({
        next: (response) => {
          this.successMessage = 'Artikli uspješno uvezeni';
          this.ucitajArtikle();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Greška pri uvozu artikala';
          console.error('Greška:', error);
        }
      });
    }
  }
}