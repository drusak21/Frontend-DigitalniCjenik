import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-javni-cjenik',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './javni-cjenik.component.html',
  styleUrl: './javni-cjenik.component.scss'
})
export class JavniCjenikComponent implements OnInit {
  qrKod: string = '';
  objektNaziv: string = 'Caffe Bar Primjer';
  kategorije: any[] = [];
  aktivnaKategorija: number = 0;
  jezik: string = 'HR';
  isLoggedIn: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
     this.qrKod = this.route.snapshot.paramMap.get('qrKod') || 'default';
  
  if (this.qrKod === 'default') {
    
    this.objektNaziv = 'Digitalni Cjenik - Demo';
  }
  
  this.provjeriPrijavu();
  this.ucitajCjenik();
  }

  provjeriPrijavu() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  ucitajCjenik() {

    this.kategorije = [
      {
        id: 0,
        naziv: 'Sve',
        proizvodi: []
      },
      {
        id: 1,
        naziv: 'Pića',
        proizvodi: [
          { naziv: 'Kava', cijena: '1.50 €', brand: 'Lavazza' },
          { naziv: 'Čaj', cijena: '1.20 €', brand: 'Franck' },
          { naziv: 'Kakao', cijena: '1.80 €', brand: 'Franck' }
        ]
      },
      {
        id: 2,
        naziv: 'Hrana',
        proizvodi: [
          { naziv: 'Sendvič', cijena: '3.50 €', brand: 'Lokalno' },
          { naziv: 'Pizza', cijena: '8.90 €', brand: 'Lokalno' },
          { naziv: 'Špageti', cijena: '7.50 €', brand: 'Lokalno' }
        ]
      },
      {
        id: 3,
        naziv: 'Panonski Izvori',
        proizvodi: [
          { naziv: 'Panonski Izvori voda 0.5L', cijena: '1.20 €', brand: 'PanonskiIzvori' },
          { naziv: 'Panonski Izvori gazirana 0.5L', cijena: '1.30 €', brand: 'PanonskiIzvori' },
          { naziv: 'Panonski Izvori sok jabuka', cijena: '2.00 €', brand: 'PanonskiIzvori' }
        ]
      }
    ];
  }

  promijeniKategoriju(id: number) {
    this.aktivnaKategorija = id;
  }

  promijeniJezik() {
    this.jezik = this.jezik === 'HR' ? 'EN' : 'HR';
  }
}