export interface Artikl {
  id: number;
  naziv: string;
  opis: string;
  cijena: number;
  sastavAlergeni: string;
  slika: string;
  brand: string;
  zakljucan: boolean; 
  kategorijaID: number;
}

export interface CreateArtiklDTO {
  naziv: string;
  opis?: string;
  cijena: number;
  sastavAlergeni?: string;
  slika?: string;
  brand: string;
  zakljucan: boolean;
  kategorijaID: number;
}

export interface UpdateArtiklDTO {
  naziv?: string;
  opis?: string;
  cijena?: number;
  sastavAlergeni?: string;
  slika?: string;
  brand?: string;
  zakljucan?: boolean;
  kategorijaID?: number;
}