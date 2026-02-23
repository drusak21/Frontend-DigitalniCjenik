export interface Korisnik {
  id: number;
  imePrezime: string;
  email: string;
  uloga: Uloga;
  jezikSucelja: string;
  aktivnost: boolean;
}

export interface Uloga {
  id: number;
  naziv: 'Administrator' | 'Putnik' | 'Ugostitelj' | 'Gost';
  opis: string;
}