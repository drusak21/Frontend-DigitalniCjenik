export interface Kategorija {
  id: number;
  naziv: string;
  redoslijedPrikaza: number;
  aktivan: boolean;
}

export interface Artikl {
  id: number;
  naziv: string;
  opis?: string;
  cijena: number;
  sastavAlergeni?: string;
  slika?: string;
  brand: string;
  zakljucan: boolean;
  kategorijaId: number;
  kategorijaNaziv?: string; 
}

export interface CreateKategorijaDTO {
  naziv: string;
  redoslijedPrikaza: number;
  aktivan: boolean;
}

export interface UpdateKategorijaDTO {
  naziv?: string;
  redoslijedPrikaza?: number;
  aktivan?: boolean;
}