export interface AnalitikaDogadaj {
  id: number;
  tipDogadaja: 'QR scan' | 'otvoren cjenik' | 'klik banner' | 'klik SKU' | 'pregled kategorije';
  datumVrijeme: string;
  objektID: number;
  objektNaziv?: string;
  cjenikID?: number;
  dodatniParametri?: string;
}

export interface DashboardPodaci {
  ukupnoQr: number;
  ukupnoOtvorenih: number;
  ukupnoKlikova: number;
  poDanima: DanPodaci[];
}

export interface DanPodaci {
  datum: string;
  qr: number;
  otvaranja: number;
  klikovi: number;
}