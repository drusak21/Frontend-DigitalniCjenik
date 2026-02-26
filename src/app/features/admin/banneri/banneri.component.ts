import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BanneriService } from '../../../core/services/banneri.service';
import { ObjektiService } from '../../../core/services/objekti.service';
import { AkcijeService } from '../../../core/services/akcije.service';
import { Banner, CreateBannerDTO } from '../../../core/models/banner.model';
import { Objekt } from '../../../core/models/objekt.model';
import { Akcija } from '../../../core/models/akcija.model';

@Component({
  selector: 'app-banneri',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banneri.component.html',
  styleUrls: ['./banneri.component.scss']
})
export class BanneriComponent implements OnInit {
  banneri: Banner[] = [];
  objekti: Objekt[] = [];
  akcije: Akcija[] = [];
  
  // Za novi banner
  noviBanner: CreateBannerDTO = {
    tip: 'homepage',
    sadrzaj: '',
    objektID: 0,
    akcijaID: undefined
  };

  // Za edit
  editBanner: Banner | null = null;
  editData: any = {
    tip: 'homepage',
    sadrzaj: '',
    objektID: 0,
    akcijaID: undefined
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  prikaziFormu = false;
  searchTerm = '';
  filterTip: string = '';

  constructor(
    private banneriService: BanneriService,
    private objektiService: ObjektiService,
    private akcijeService: AkcijeService
  ) {}

  ngOnInit(): void {
    this.ucitajObjekte();
    this.ucitajAkcije();
    this.ucitajBannere();
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

  ucitajAkcije(): void {
    this.akcijeService.getSveAkcije().subscribe({
      next: (data) => {
        this.akcije = data;
      },
      error: (error) => {
        console.error('Greška pri učitavanju akcija:', error);
      }
    });
  }

  ucitajBannere(): void {
    this.loading = true;
    this.banneriService.getSviBanneri().subscribe({
      next: (data) => {
        this.banneri = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Greška pri učitavanju banner-a';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  dodajBanner(): void {
    if (!this.noviBanner.sadrzaj || !this.noviBanner.objektID) {
      this.errorMessage = 'Sadržaj i objekt su obavezni';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    this.banneriService.createBanner(this.noviBanner).subscribe({
      next: (banner) => {
        this.banneri.push(banner);
        this.resetFormu();
        this.successMessage = 'Banner uspješno dodan';
        this.loading = false;
        this.prikaziFormu = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri dodavanju banner-a';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  urediBanner(banner: Banner): void {
    this.editBanner = banner;
    this.editData = {
      tip: banner.tip,
      sadrzaj: banner.sadrzaj || '',
      objektID: banner.objektID,
      akcijaID: banner.akcijaID || undefined
    };
  }

  spremiIzmjene(): void {
    if (!this.editBanner) return;

    this.loading = true;
    
    this.banneriService.updateBanner(this.editBanner.id, {
      tip: this.editData.tip,
      sadrzaj: this.editData.sadrzaj,
      objektID: this.editData.objektID,
      akcijaID: this.editData.akcijaID || undefined
    }).subscribe({
      next: (response) => {
        this.ucitajBannere();
        this.editBanner = null;
        this.successMessage = 'Banner uspješno ažuriran';
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri ažuriranju banner-a';
        this.loading = false;
        console.error('Greška:', error);
      }
    });
  }

  obrisiBanner(id: number): void {
    if (confirm('Jeste li sigurni da želite obrisati ovaj banner?')) {
      this.loading = true;
      this.banneriService.deleteBanner(id).subscribe({
        next: () => {
          this.banneri = this.banneri.filter(b => b.id !== id);
          this.successMessage = 'Banner uspješno obrisan';
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Greška pri brisanju banner-a';
          this.loading = false;
          console.error('Greška:', error);
        }
      });
    }
  }

  toggleAktivnost(banner: Banner): void {
    this.loading = true;
    const novaVrijednost = !banner.aktivan;
    
    this.banneriService.aktivirajBanner(banner.id, novaVrijednost).subscribe({
      next: () => {
        banner.aktivan = novaVrijednost;
        this.successMessage = `Banner ${novaVrijednost ? 'aktiviran' : 'deaktiviran'}`;
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

  getNazivAkcije(akcijaID: any): string {
  if (!akcijaID) return '-';
  
  const akcija = this.akcije.find(a => a.id === akcijaID);
  return akcija ? akcija.naziv : 'Nepoznato';
}

  resetFormu(): void {
    this.noviBanner = {
      tip: 'homepage',
      sadrzaj: '',
      objektID: 0,
      akcijaID: undefined
    };
    this.editBanner = null;
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editBanner = null;
    this.editData = {};
  }

  get filtriraniBanneri(): Banner[] {
    let filtrirano = this.banneri;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtrirano = filtrirano.filter(b => 
        b.sadrzaj?.toLowerCase().includes(term) ||
        this.getNazivObjekta(b.objektID).toLowerCase().includes(term)
      );
    }
    
    if (this.filterTip) {
      filtrirano = filtrirano.filter(b => 
        b.tip.toLowerCase() === this.filterTip.toLowerCase()
      );
    }
    
    return filtrirano;
  }
}