export interface Banner {
    id: number;
    tip: string;
    sadrzaj?: string;
    aktivan: boolean;
    objektID: number;
    objektNaziv?: string;
    akcijaID?: number | null;
    akcijaNaziv?: string | null;
}

export interface CreateBannerDTO {
  tip: string;
  sadrzaj?: string;
  objektID: number;
  akcijaID?: number;
}

export interface UpdateBannerDTO {
  tip?: string;
  sadrzaj?: string;
  objektID?: number;
  akcijaID?: number;
  aktivan?: boolean;
}