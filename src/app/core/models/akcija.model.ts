export interface Akcija {
  id: number;
  naziv: string;
  opis?: string;
  vrsta: string;  
  datumPocetka?: string;
  datumZavrsetka?: string;
  slika?: string;
  aktivna: boolean;
  objektID: number;
  objektNaziv?: string;
  artiklID?: number | null;
  artiklNaziv?: string | null;
  aktivnaSada?: boolean;
}

export interface CreateAkcijaDTO {
  naziv: string;
  opis?: string;
  vrsta: string;
  datumPocetka?: string;
  datumZavrsetka?: string;
  slika?: string;
  objektID: number;
  artiklID?: number;  
}

export interface UpdateAkcijaDTO {
  naziv?: string;
  opis?: string;
  vrsta?: string;
  datumPocetka?: string;
  datumZavrsetka?: string;
  slika?: string;
  objektID?: number;
  artiklID?: number; 
  aktivna?: boolean;
}