export enum PlaneCarriersAuthentic {
  ACA = 'Air Canada',
  DAL = 'Delta',
  DLH = 'Lufthansa',
}

export const PlaneCarriersAuthenticSpoken: { [key: string]: string } = {
  'air canada': 'ACA',
  delta: 'DAL',
  lufthansa: 'DLH',
};

export enum PlaneCarriersCasual {
  Bravo = 'Bravo',
  Charlie = 'Charlie',
  Delta = 'Delta',
  // Echo = 'Echo',
}

export const PlaneCarriersCasualSpoken: { [key: string]: string } = {
  bravo: 'Bravo',
  charlie: 'Charlie',
  delta: 'Delta',
  echo: 'Echo',
};
