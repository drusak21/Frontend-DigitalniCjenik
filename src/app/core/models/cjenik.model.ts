export interface Cjenik {
  id: number;
  naziv: string;
  objektId: number;
  status: 'aktivni' | 'u_pripremi' | 'na_potvrdi' | 'arhiviran';
  datumKreiranja: Date;
  datumPotvrde?: Date;
  potvrdioPutnikId?: number;
}