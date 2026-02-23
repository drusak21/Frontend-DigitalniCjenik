export interface Korisnik {
  id: number;
  imePrezime: string;
  email: string;
  ulogaNaziv: string;        // ← Ovo je ono što backend vraća
  opisUloge?: string;        
  jezikSucelja?: string;
  aktivnost: boolean;
}

export interface Uloga {
  id: number;
  naziv: string;  // "Administrator", "Putnik", "Ugostitelj"
}

export interface CreateKorisnikRequest {
  imePrezime: string;
  email: string;
  lozinka?: string;
  ulogaID: number;          
  jezikSucelja?: string;
}

export interface UpdateKorisnikRequest {
  imePrezime?: string;
  email?: string;
  ulogaID?: number;
  jezikSucelja?: string;
  aktivnost?: boolean;
}

export interface LoginRequest {
  email: string;
  lozinka: string;
}

export interface LoginResponse {
  token: string;
  uloga: string;
  imePrezime: string;
}