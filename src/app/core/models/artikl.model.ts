export interface Artikl {
  id: number;
  naziv: string;
  opis: string;
  cijena: number;
  sastav: string;
  alergeni: string[];
  slika: string;
  brand: 'PanonskiIzvori' | 'Ostalo';
  zakljucan: boolean; 
  kategorijaId: number;
}