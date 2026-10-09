import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

function getInitialStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

import type {
  Page,
  SearchCriteria,
  Flight,
  FlightClass,
  Passenger,
  Booking,
  Ticket,
  Transaction,
  PaymentMethod,
  MultiCitySegment,
} from './types';

import { generateFlights, generateBookingCode, uid } from './data';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  walletBalance: number;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface ConfirmBookingInput {
  passengers: Passenger[];
  contact: ContactInfo;
  paymentMethod: PaymentMethod;
}

export interface MultiCityResult {
  segment: MultiCitySegment;
  flights: Flight[];
  flightClasses: FlightClass[];
}

interface AppState {
  page: Page;
  navigate: (page: Page) => void;

  search: SearchCriteria;
  setSearch: (s: SearchCriteria) => void;

  flights: Flight[];
  flightClasses: FlightClass[];
  loadFlights: (from: string, to: string) => void;

  multiCityResults: MultiCityResult[];
  loadMultiCityFlights: (segments: MultiCitySegment[]) => void;

  selectedFlight: Flight | null;
  selectedClass: FlightClass | null;
  selectFlightClass: (flight: Flight, flightClass: FlightClass) => void;

  selectedSeats: string[];
  setSelectedSeats: (seats: string[]) => void;

  occupiedSeatsForClass: (classId: string) => string[];

  bookings: Booking[];
  tickets: Ticket[];
  passengers: Passenger[];
  transactions: Transaction[];

  confirmBooking: (
    input: ConfirmBookingInput
  ) => { error: string | null; booking?: Booking };

  user: AuthUser | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;

  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: string | null }>;

  logout: () => Promise<void>;

  authLoading: boolean;
}

const defaultSearch: SearchCriteria = {
  fromCode: 'SGN',
  toCode: 'HAN',
  departureDate: '',
  returnDate: '',
  passengers: 1,
  cabinClass: 'Economy',
  tripType: 'one-way',
};



const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home');

  const [search, setSearch] =
    useState<SearchCriteria>(defaultSearch);

  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightClasses, setFlightClasses] = useState<FlightClass[]>([]);

  const [multiCityResults, setMultiCityResults] = useState<
    MultiCityResult[]
  >([]);

  const [selectedFlight, setSelectedFlight] =
    useState<Flight | null>(null);

  const [selectedClass, setSelectedClass] =
    useState<FlightClass | null>(null);

  const [selectedSeats, setSelectedSeats] =
    useState<string[]>([]);

  const [bookings, setBookings] = useState<Booking[]>(() =>
    getInitialStorage('skyticket_bookings', [])
  );
  const [tickets, setTickets] = useState<Ticket[]>(() =>
    getInitialStorage('skyticket_tickets', [])
  );
  const [passengers, setPassengers] = useState<Passenger[]>(() =>
    getInitialStorage('skyticket_passengers', [])
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getInitialStorage('skyticket_transactions', [])
  );

  const [user, setUser] = useState<AuthUser | null>(() =>
    getInitialStorage('skyticket_user', null)
  );

  useEffect(() => {
    try {
      localStorage.setItem('skyticket_bookings', JSON.stringify(bookings));
    } catch { /* ignore */ }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem('skyticket_tickets', JSON.stringify(tickets));
    } catch { /* ignore */ }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem('skyticket_passengers', JSON.stringify(passengers));
    } catch { /* ignore */ }
  }, [passengers]);

  useEffect(() => {
    try {
      localStorage.setItem('skyticket_transactions', JSON.stringify(transactions));
    } catch { /* ignore */ }
  }, [transactions]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('skyticket_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('skyticket_user');
      }
    } catch { /* ignore */ }
  }, [user]);

  const [seedOccupied, setSeedOccupied] = useState<
    Record<string, string[]>
  >({});

  const navigate = useCallback((p: Page) => {
    setPage(p);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const loadFlights = useCallback((from: string, to: string) => {
    const inventory = generateFlights(from, to);

    setFlights(inventory.flights);

    setFlightClasses(prev => {
      const map = new Map(prev.map(c => [c.id, c]));

      for (const fc of inventory.flightClasses) {
        if (!map.has(fc.id)) {
          map.set(fc.id, fc);
        }
      }

      return Array.from(map.values());
    });

    setSeedOccupied(prev => {
      const next = { ...prev };

      for (const [classId, seats] of Object.entries(
        inventory.occupiedSeats
      )) {
        if (!next[classId]) {
          next[classId] = seats;
        }
      }

      return next;
    });
  }, []);

  const loadMultiCityFlights = useCallback(
    (segments: MultiCitySegment[]) => {
      const results: MultiCityResult[] = [];

      for (const segment of segments) {
        const inventory = generateFlights(
          segment.fromCode,
          segment.toCode
        );

        results.push({
          segment,
          flights: inventory.flights,
          flightClasses: inventory.flightClasses,
        });

        setSeedOccupied(prev => {
          const next = { ...prev };

          for (const [classId, seats] of Object.entries(
            inventory.occupiedSeats
          )) {
            if (!next[classId]) {
              next[classId] = seats;
            }
          }

          return next;
        });
      }

      setMultiCityResults(results);

      if (results.length > 0) {
        setFlights(results[0].flights);
        setFlightClasses(prev => {
          const map = new Map(prev.map(c => [c.id, c]));

          for (const result of results) {
            for (const fc of result.flightClasses) {
              if (!map.has(fc.id)) {
                map.set(fc.id, fc);
              }
            }
          }

          return Array.from(map.values());
        });
      }
    },
    []
  );

  const selectFlightClass = useCallback(
    (flight: Flight, flightClass: FlightClass) => {
      setSelectedFlight(flight);
      setSelectedClass(flightClass);
      setSelectedSeats([]);
    },
    []
  );

  const occupiedSeatsForClass = useCallback(
    (classId: string) => {
      const booked = tickets
        .filter(t => t.classId === classId)
        .map(t => t.seatNumber);

      const seeded = seedOccupied[classId] ?? [];

      return [...new Set([...seeded, ...booked])];
    },
    [tickets, seedOccupied]
  );

  const login = useCallback(
    async (email: string, _password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const userId = 'user-' + normalizedEmail.replace(/[^a-z0-9]/g, '_');

      const existingUsers = getInitialStorage<Record<string, AuthUser>>('skyticket_users_db', {});
      const existingUser = existingUsers[normalizedEmail];

      const nameFromEmail = normalizedEmail.split('@')[0] || 'Người dùng';
      const defaultName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

      const loggedUser: AuthUser = {
        id: userId,
        email: normalizedEmail,
        name: existingUser?.name || defaultName,
        walletBalance: existingUser ? existingUser.walletBalance : 15_000_000,
      };

      existingUsers[normalizedEmail] = loggedUser;
      try {
        localStorage.setItem('skyticket_users_db', JSON.stringify(existingUsers));
      } catch { /* ignore */ }

      setUser(loggedUser);
      return { error: null };
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      _password: string,
      name: string
    ) => {
      const normalizedEmail = email.trim().toLowerCase();
      const userId = 'user-' + normalizedEmail.replace(/[^a-z0-9]/g, '_');
      const registeredName = name.trim() || normalizedEmail.split('@')[0] || 'Người dùng';

      const existingUsers = getInitialStorage<Record<string, AuthUser>>('skyticket_users_db', {});
      const loggedUser: AuthUser = {
        id: userId,
        email: normalizedEmail,
        name: registeredName,
        walletBalance: 15_000_000,
      };

      existingUsers[normalizedEmail] = loggedUser;
      try {
        localStorage.setItem('skyticket_users_db', JSON.stringify(existingUsers));
      } catch { /* ignore */ }

      setUser(loggedUser);
      return { error: null };
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
  }, []);

  const confirmBooking = useCallback(
    (
      input: ConfirmBookingInput
    ): {
      error: string | null;
      booking?: Booking;
    } => {
      if (!selectedFlight || !selectedClass) {
        return {
          error: 'Chưa chọn chuyến bay hoặc hạng vé.',
        };
      }

      if (
        selectedSeats.length !==
        input.passengers.length
      ) {
        return {
          error: 'Số ghế chưa khớp số hành khách.',
        };
      }

      if (
        input.passengers.length !==
        search.passengers
      ) {
        return {
          error: 'Số hành khách không khớp tìm kiếm.',
        };
      }

      const subtotal =
        selectedClass.price *
        input.passengers.length;

      const taxAndFees =
        Math.round(subtotal * 0.1);

      const totalAmount =
        subtotal + taxAndFees;

      const userId = user?.id ?? 'guest';

      if (input.paymentMethod === 'wallet') {
        if (!user) {
          return {
            error:
              'Vui lòng đăng nhập để thanh toán bằng ví.',
          };
        }

        if (user.walletBalance < totalAmount) {
          return {
            error:
              'Số dư ví không đủ. Vui lòng chọn thanh toán trực tiếp hoặc nạp thêm.',
          };
        }
      }

      const booking: Booking = {
        id: uid('bkg'),
        code: generateBookingCode(),
        userId,
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
        totalAmount,
        taxAndFees,
        paymentMethod: input.paymentMethod,
        contactEmail: input.contact.email,
        contactPhone: input.contact.phone,
      };

      const newPassengers =
        input.passengers.map(p => ({
          ...p,
          id: p.id || uid('pax'),
        }));

      const newTickets: Ticket[] =
        newPassengers.map((p, i) => ({
          id: uid('tkt'),
          bookingId: booking.id,
          flightId: selectedFlight.id,
          classId: selectedClass.id,
          passengerId: p.id,
          seatNumber: selectedSeats[i],
          price: selectedClass.price,
        }));

      setBookings(prev => [
        booking,
        ...prev,
      ]);

      setPassengers(prev => [
        ...prev,
        ...newPassengers,
      ]);

      setTickets(prev => [
        ...prev,
        ...newTickets,
      ]);

      setFlightClasses(prev =>
        prev.map(fc =>
          fc.id === selectedClass.id
            ? {
                ...fc,
                availableSeats: Math.max(
                  0,
                  fc.availableSeats -
                    newTickets.length
                ),
              }
            : fc
        )
      );

      setSelectedClass(prev =>
        prev &&
        prev.id === selectedClass.id
          ? {
              ...prev,
              availableSeats: Math.max(
                0,
                prev.availableSeats -
                  newTickets.length
              ),
            }
          : prev
      );

      if (
        input.paymentMethod === 'wallet' &&
        user
      ) {
        const balanceAfter =
          user.walletBalance -
          totalAmount;

        const tx: Transaction = {
          id: uid('txn'),
          userId: user.id,
          bookingId: booking.id,
          type: 'DEBIT',
          amount: totalAmount,
          balanceAfter,
          description:
            `Thanh toán vé ${booking.code} · ${selectedFlight.flightNumber}`,
          createdAt:
            new Date().toISOString(),
        };

        const updatedUser = {
          ...user,
          walletBalance: balanceAfter,
        };

        const existingUsers = getInitialStorage<Record<string, AuthUser>>('skyticket_users_db', {});
        existingUsers[user.email.toLowerCase()] = updatedUser;
        try {
          localStorage.setItem('skyticket_users_db', JSON.stringify(existingUsers));
        } catch { /* ignore */ }

        setUser(updatedUser);

        setTransactions(prev => [
          tx,
          ...prev,
        ]);
      }

      return {
        error: null,
        booking,
      };
    },
    [
      selectedFlight,
      selectedClass,
      selectedSeats,
      search.passengers,
      user,
    ]
  );

  return (
    <AppContext.Provider
      value={{
        page,
        navigate,

        search,
        setSearch,

        flights,
        flightClasses,
        loadFlights,

        multiCityResults,
        loadMultiCityFlights,

        selectedFlight,
        selectedClass,
        selectFlightClass,

        selectedSeats,
        setSelectedSeats,

        occupiedSeatsForClass,

        bookings,
        tickets,
        passengers,
        transactions,

        confirmBooking,

        user,
        login,
        signUp,
        logout,

        authLoading: false,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error(
      'useApp must be used within AppProvider'
    );
  }

  return ctx;
}
