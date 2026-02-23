export interface Akcija {
  id: number;
  naziv: string;
  opis: string;
  vrsta: 'PanonskiIzvori' | 'Lokalna';
  datumPocetka: Date;
  datumZavrsetka: Date;
  slika: string;
  objektId: number;
  aktivna: boolean;
}