import type { Airport, Airline, Flight, FlightClass, SeatClass } from './types';

export const airports: Airport[] = [
  { code: 'SGN', city: 'Hồ Chí Minh', name: 'Sân bay Tân Sơn Nhất', country: 'Việt Nam' },
  { code: 'HAN', city: 'Hà Nội', name: 'Sân bay Nội Bài', country: 'Việt Nam' },
  { code: 'DAD', city: 'Đà Nẵng', name: 'Sân bay Đà Nẵng', country: 'Việt Nam' },
  { code: 'PQC', city: 'Phú Quốc', name: 'Sân bay Phú Quốc', country: 'Việt Nam' },
  { code: 'CXI', city: 'Cam Ranh', name: 'Sân bay Cam Ranh', country: 'Việt Nam' },
  { code: 'HUI', city: 'Huế', name: 'Sân bay Phú Bài', country: 'Việt Nam' },
  { code: 'DLI', city: 'Đà Lạt', name: 'Sân bay Liên Khương', country: 'Việt Nam' },
  { code: 'VCA', city: 'Cần Thơ', name: 'Sân bay Cần Thơ', country: 'Việt Nam' },
  { code: 'VDO', city: 'Quy Nhơn', name: 'Sân bay Phù Cát', country: 'Việt Nam' },
  { code: 'HPH', city: 'Hải Phòng', name: 'Sân bay Cát Bi', country: 'Việt Nam' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thái Lan' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita Airport', country: 'Nhật Bản' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon Airport', country: 'Hàn Quốc' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong Airport', country: 'Hong Kong' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'KLIA Airport', country: 'Malaysia' },
];

export const airlines: Airline[] = [
  { id: 'vn', name: 'Vietnam Airlines', code: 'VN', logoColor: '#1565C0', logoText: 'VN', textColor: '#FFFFFF', rating: 4.5 },
  { id: 'vna', name: 'Vietjet Air', code: 'VJ', logoColor: '#D50000', logoText: 'VJ', textColor: '#FFFFFF', rating: 4.0 },
  { id: 'bb', name: 'Bamboo Airways', code: 'QH', logoColor: '#00897B', logoText: 'QH', textColor: '#FFFFFF', rating: 4.2 },
  { id: 'pa', name: 'Pacific Airlines', code: 'BL', logoColor: '#37474F', logoText: 'BL', textColor: '#FFFFFF', rating: 3.8 },
  { id: 'tg', name: 'Thai Airways', code: 'TG', logoColor: '#6A1B9A', logoText: 'TG', textColor: '#FFFFFF', rating: 4.6 },
  { id: 'sq', name: 'Singapore Airlines', code: 'SQ', logoColor: '#003875', logoText: 'SQ', textColor: '#FFFFFF', rating: 4.8 },
  { id: 'jl', name: 'Japan Airlines', code: 'JL', logoColor: '#C62828', logoText: 'JL', textColor: '#FFFFFF', rating: 4.7 },
  { id: 'ke', name: 'Korean Air', code: 'KE', logoColor: '#1A237E', logoText: 'KE', textColor: '#FFFFFF', rating: 4.5 },
];

export const cabinClasses: { id: SeatClass; name: string }[] = [
  { id: 'Economy', name: 'Phổ thông (Economy)' },
  { id: 'Business', name: 'Thương gia (Business)' },
  { id: 'VIP', name: 'VIP' },
];

export const identityTypeLabels: Record<string, string> = {
  ID_CARD: 'CCCD / CMND',
  PASSPORT: 'Hộ chiếu',
  DRIVER_LICENSE: 'GPLX',
};

export const genderLabels: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export const seatClassLabels: Record<SeatClass, string> = {
  Economy: 'Phổ thông',
  Business: 'Thương gia',
  VIP: 'VIP',
};

const CLASS_PRICE_MULTIPLIER: Record<SeatClass, number> = {
  Economy: 1,
  Business: 1.85,
  VIP: 2.75,
};

/* =========================
   SƠ ĐỒ GHẾ
   ========================= */

export interface SeatLayout {
  rows: number;
  startRow: number;
  letters: string[];
  aisleAfterIndex: number;
}

export function getSeatLayout(seatClass: SeatClass): SeatLayout {
  // VIP: hàng 1 -> 2
  if (seatClass === 'VIP') {
    return {
      rows: 2,
      startRow: 1,
      letters: ['A', 'C', 'D', 'F'],
      aisleAfterIndex: 1,
    };
  }

  // Business: hàng 3 -> 7
  if (seatClass === 'Business') {
    return {
      rows: 5,
      startRow: 3,
      letters: ['A', 'C', 'D', 'F'],
      aisleAfterIndex: 1,
    };
  }

  // Economy: hàng 8 -> 17
  return {
    rows: 10,
    startRow: 8,
    letters: ['A', 'B', 'C', 'D', 'E', 'F'],
    aisleAfterIndex: 2,
  };
}

export function listSeatNumbers(seatClass: SeatClass): string[] {
  const layout = getSeatLayout(seatClass);
  const seats: string[] = [];

  for (
    let row = layout.startRow;
    row < layout.startRow + layout.rows;
    row++
  ) {
    for (const letter of layout.letters) {
      seats.push(`${row}${letter}`);
    }
  }

  return seats;
}

const routePrices: Record<string, number> = {
  'SGN-HAN': 1850000, 'HAN-SGN': 1850000,
  'SGN-DAD': 1250000, 'DAD-SGN': 1250000,
  'SGN-PQC': 1500000, 'PQC-SGN': 1500000,
  'SGN-CXI': 1350000, 'CXI-SGN': 1350000,
  'SGN-DLI': 1400000, 'DLI-SGN': 1400000,
  'HAN-DAD': 1100000, 'DAD-HAN': 1100000,
  'HAN-PQC': 2200000, 'PQC-HAN': 2200000,
  'HAN-CXI': 1900000, 'CXI-HAN': 1900000,
  'SGN-BKK': 2800000, 'BKK-SGN': 2800000,
  'SGN-SIN': 3100000, 'SIN-SGN': 3100000,
  'SGN-NRT': 6500000, 'NRT-SGN': 6500000,
  'SGN-ICN': 5800000, 'ICN-SGN': 5800000,
  'SGN-HKG': 3400000, 'HKG-SGN': 3400000,
  'SGN-KUL': 2600000, 'KUL-SGN': 2600000,
  'HAN-BKK': 3200000, 'BKK-HAN': 3200000,
  'HAN-SIN': 3500000, 'SIN-HAN': 3500000,
  'HAN-NRT': 7000000, 'NRT-HAN': 7000000,
  'HAN-ICN': 6200000, 'ICN-HAN': 6200000,
  'DAD-BKK': 3000000, 'BKK-DAD': 3000000,
  'DAD-SIN': 3300000, 'SIN-DAD': 3300000,
  'BKK-SIN': 2500000, 'SIN-BKK': 2500000,
  'NRT-ICN': 3500000, 'ICN-NRT': 3500000,
  'HKG-BKK': 2200000, 'BKK-HKG': 2200000,
  'KUL-SIN': 1800000, 'SIN-KUL': 1800000,
};

function getRoutePrice(from: string, to: string): number {
  const key = `${from}-${to}`;

  if (routePrices[key]) {
    return routePrices[key];
  }

  // Deterministic fallback price based on airport codes to avoid fluctuating prices
  const hash =
    ((from.charCodeAt(0) * 31 + (from.charCodeAt(1) || 0)) * 17 +
      (to.charCodeAt(0) * 31 + (to.charCodeAt(1) || 0))) %
    100;
  return 2000000 + hash * 30000;
}

const timeSlots = [
  '06:00', '06:45', '07:30', '08:00', '08:45', '09:15', '10:00', '10:30',
  '11:15', '12:00', '12:45', '13:30', '14:00', '14:45', '15:30', '16:00',
  '16:45', '17:30', '18:00', '18:45', '19:30', '20:00', '20:45', '21:15',
];

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;

  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function durationStr(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return `${h}h ${m}m`;
}

function seedRandom(seed: number): () => number {
  let s = seed;

  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export interface GeneratedInventory {
  flights: Flight[];
  flightClasses: FlightClass[];
  occupiedSeats: Record<string, string[]>;
}

export function generateFlights(
  fromCode: string,
  toCode: string
): GeneratedInventory {
  if (fromCode === toCode) {
    return {
      flights: [],
      flightClasses: [],
      occupiedSeats: {},
    };
  }

  const rng = seedRandom(
    fromCode.charCodeAt(0) * 1000 +
    toCode.charCodeAt(0) * 100 +
    fromCode.charCodeAt(1)
  );

  const routePrice = getRoutePrice(fromCode, toCode);

  const isIntl =
    airports.find(a => a.code === fromCode)?.country !== 'Việt Nam' ||
    airports.find(a => a.code === toCode)?.country !== 'Việt Nam';

  const flights: Flight[] = [];
  const flightClasses: FlightClass[] = [];
  const occupiedSeats: Record<string, string[]> = {};

  const numFlights = 8 + Math.floor(rng() * 6);

  const classes: SeatClass[] = [
    'Economy',
    'Business',
    'VIP',
  ];

  for (let i = 0; i < numFlights; i++) {
    const airline =
      airlines[Math.floor(rng() * airlines.length)];

    const depTime =
      timeSlots[Math.floor(rng() * timeSlots.length)];

    const flightMins =
      60 + Math.floor(rng() * (isIntl ? 360 : 120));

    const arrTime =
      addMinutes(depTime, flightMins);

    const stops =
      rng() > 0.7 ? 1 : 0;

    const stopCities =
      stops > 0
        ? [airports[Math.floor(rng() * airports.length)].code]
        : [];

    const priceVariation =
      0.85 + rng() * 0.5;

    const economyPrice =
      Math.round(
        (routePrice * priceVariation) / 1000
      ) * 1000;

    const flightId =
      `${fromCode}-${toCode}-${i}`;

    flights.push({
      id: flightId,
      airlineId: airline.id,
      flightNumber:
        `${airline.code}${100 + Math.floor(rng() * 900)}`,
      departureCode: fromCode,
      arrivalCode: toCode,
      departureTime: depTime,
      arrivalTime: arrTime,
      duration: durationStr(flightMins),
      stops,
      stopCities,
      currency: 'VND',
      baggage: rng() > 0.4 ? '20kg' : '7kg',
    });

    for (const seatClass of classes) {
      const allSeats =
        listSeatNumbers(seatClass);

      const capacity =
        allSeats.length;

      const takenCount =
        Math.floor(
          rng() * Math.min(4, capacity - 2)
        );

      const taken =
        allSeats.filter(
          (_, idx) => idx < takenCount
        );

      const classId =
        `${flightId}-${seatClass}`;

      occupiedSeats[classId] =
        taken;

      flightClasses.push({
        id: classId,
        flightId,
        seatClass,
        price:
          Math.round(
            (
              economyPrice *
              CLASS_PRICE_MULTIPLIER[seatClass]
            ) / 1000
          ) * 1000,
        availableSeats:
          capacity - takenCount,
      });
    }
  }

  return {
    flights: flights.sort(
      (a, b) =>
        a.departureTime.localeCompare(
          b.departureTime
        )
    ),
    flightClasses,
    occupiedSeats,
  };
}

export function minClassPrice(
  classes: FlightClass[]
): number {
  if (classes.length === 0) {
    return 0;
  }

  return Math.min(
    ...classes.map(c => c.price)
  );
}

export function getAirline(
  id: string
): Airline | undefined {
  return airlines.find(
    a => a.id === id
  );
}

export function getAirport(
  code: string
): Airport | undefined {
  return airports.find(
    a => a.code === code
  );
}

export function formatPrice(
  price: number
): string {
  return price.toLocaleString('vi-VN') + ' ₫';
}

export function parseDuration(
  d: string
): number {
  const match =
    d.match(/(\d+)h\s*(\d+)?m?/);

  if (!match) {
    return 0;
  }

  return (
    parseInt(match[1]) * 60 +
    (match[2]
      ? parseInt(match[2])
      : 0)
  );
}

export function generateBookingCode(): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';

  let code = '';

  for (let i = 0; i < 6; i++) {
    code +=
      chars[
        Math.floor(
          Math.random() * chars.length
        )
      ];
  }

  return 'SKY' + code;
}

export function uid(
  prefix: string
): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}