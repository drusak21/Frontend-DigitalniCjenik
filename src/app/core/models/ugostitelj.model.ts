export interface Ugostitelj {
  id: number;
  naziv: string;
  kontaktEmail?: string;
  kontaktTelefon?: string;
  oib?: string;
  logotip?: string;
  brandingBoje?: string;
  korisnikId: number;
  korisnik?: {
    id: number;
    imePrezime: string;
    email: string;
  };
}

export interface CreateUgostiteljDTO {
  naziv: string;
  kontaktEmail?: string;
  kontaktTelefon?: string;
  oib?: string;
  logotip?: string;
  brandingBoje?: string;
  korisnikId: number;
}

export interface UpdateUgostiteljDTO {
  naziv?: string;
  kontaktEmail?: string;
  kontaktTelefon?: string;
  oib?: string;
  logotip?: string;
  brandingBoje?: string;
  korisnikId?: number;
}