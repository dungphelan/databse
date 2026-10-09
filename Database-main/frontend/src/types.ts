export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface Airline {
  id: string;
  name: string;
  code: string;
  logoColor: string;
  logoText: string;
  textColor: string;
  rating: number;
}

export type SeatClass = 'Economy' | 'Business' | 'VIP';

export interface Flight {
  id: string;
  airlineId: string;
  flightNumber: string;
  departureCode: string;
  arrivalCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopCities: string[];
  currency: string;
  baggage: string;
}

export interface FlightClass {
  id: string;
  flightId: string;
  seatClass: SeatClass;
  price: number;
  availableSeats: number;
}

export type IdentityType = 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Passenger {
  id: string;
  fullName: string;
  birthDate: string;
  gender: Gender;
  identityType: IdentityType;
  identityNumber: string;
  nationality: string;
}

export interface Booking {
  id: string;
  code: string;
  userId: string;
  createdAt: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  totalAmount: number;
  taxAndFees: number;
  paymentMethod: PaymentMethod;
  contactEmail: string;
  contactPhone: string;
}

export interface Ticket {
  id: string;
  bookingId: string;
  flightId: string;
  classId: string;
  passengerId: string;
  seatNumber: string;
  price: number;
}

export interface Transaction {
  id: string;
  userId: string;
  bookingId?: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface MultiCitySegment {
  fromCode: string;
  toCode: string;
  departureDate: string;
}

export interface SearchCriteria {
  fromCode: string;
  toCode: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  cabinClass: SeatClass;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  multiCitySegments?: MultiCitySegment[];
}

export type Page =
  | 'home'
  | 'list'
  | 'seat'
  | 'booking'
  | 'tickets'
  | 'transactions';

export type PaymentMethod = 'direct' | 'wallet';
