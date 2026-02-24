export interface Objekt {
  id: number;
  naziv: string;
  adresa: string;
  qrKod: string;
  qrKodBase64?: string;  // Slika QR koda
  aktivnost: boolean;
  ugostiteljID: number;
  ugostiteljNaziv?: string;
  putnikID: number;
  putnikImePrezime?: string;
}

export interface CreateObjektDTO {
  naziv: string;
  adresa: string;
  ugostiteljID: number;
  putnikID: number;
}

export interface UpdateObjektDTO {
  naziv?: string;
  adresa?: string;
  ugostiteljID?: number;
  putnikID?: number;
  aktivnost?: boolean;
}