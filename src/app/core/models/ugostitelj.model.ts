export interface Ugostitelj {
  id: number;
  naziv: string;
  kontaktEmail: string;
  kontaktTelefon: string;
  oib: string;
  logotip: string;
  boje: BrandingBoje;
  korisnikId: number;
}

export interface BrandingBoje {
  primarna: string;
  sekundarna: string;
  akcent: string;
}