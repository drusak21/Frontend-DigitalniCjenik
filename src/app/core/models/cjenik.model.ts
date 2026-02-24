export interface Cjenik {
  id: number;
  naziv: string;
  status: string; // 'aktivan', 'arhiviran', itd.
  datumKreiranja: string;
  datumPotvrde: string | null;
  objektID: number;
  objektNaziv: string;
  brojArtikala: number;
  artikli: ArtiklUCjeniku[];
}

export interface ArtiklUCjeniku {
  artiklID: number;
  artiklNaziv: string;
  cijena: number;
  redoslijedPrikaza: number;
  zakljucan: boolean;
}