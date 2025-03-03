export interface Location {
  __lat__: number;
  __lon__: number;
}

export interface TimeStamp {
  __time__: string;
}

export interface Site {
  id: string;
  siteID: string;
  name: string;
  description?: string;
  maxPeriod: boolean;
  addressRegistrationRequired: boolean;
  algoVersion: string;
  applyMaxNrOfNights: boolean;
  automaticGate: boolean;
  automaticGatePIN: boolean;
  automaticGatePhoneNumber: string;
  availablePlaces: number;
  checkAvailablePlaces: boolean;
  checkoutTime: number;
  creationDate: TimeStamp;
  electricityOption: boolean;
  email: string;
  emailCopy: boolean;
  freeVisitors: number;
  hasCheckoutTime: boolean;
  location: Location;
  lowSeasonEnd: number;
  lowSeasonPrice: number;
  lowSeasonStart: number;
  maxNrOfNights: number;
  maxPeriodPeriod: number;
  minDaysReservationCancellationRefund: number;
  onlyWaterOption: boolean;
  passportNumberRegistrationRequired: boolean;
  payingSite: boolean;
  priceForElectricity: number;
  priceForWater: number;
  pricePerNight: number;
  pricePerVisitor: number;
  reservationsAllowed: boolean;
  reservationsCancellationAllowed: boolean;
  seasonalPricing: boolean;
  splitAccount: string;
  splitAmount: number;
  status: string;
  tourismTax: boolean;
  tourismTaxOnlyAdults: boolean;
  tourismTaxPerVisitor: number;
  visitorRegistrationRequired: boolean;
  waterDevice: string;
  wifiCodes: boolean;
}

export interface Item {
  id: string;
  text: string;
}

export interface AreaRule {
  id: string;
  siteID: string;
  language: string;
  rules: string;
  createdAt?: TimeStamp;
  updatedAt?: TimeStamp;
}