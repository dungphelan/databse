import { useMemo, useState, type ComponentType } from 'react';
import { ChevronDown, Ticket, Wallet } from 'lucide-react';
import { useApp } from '@/context';
import {
  formatPrice,
  getAirline,
  getAirport,
  seatClassLabels,
  identityTypeLabels,
  genderLabels,
} from '@/data';
import type { Booking } from '@/types';

export default function MyTicketsPage({ view = 'tickets' }: { view?: 'tickets' | 'transactions' }) {
  const { bookings, tickets, passengers, transactions, flightClasses, flights, user, navigate } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);

  const myBookings = useMemo(() => {
    if (!user) return bookings.filter(b => b.userId === 'guest');
    return bookings.filter(b => b.userId === user.id || b.userId === 'guest');
  }, [bookings, user]);

  const myTx = useMemo(() => {
    if (!user) return transactions;
    return transactions.filter(t => t.userId === user.id);
  }, [transactions, user]);

  if (view === 'transactions') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
              <p className="text-sm text-gray-500 mt-1">
                {user ? `Số dư ví: ${formatPrice(user.walletBalance)}` : 'Đăng nhập để xem ví điện tử'}
              </p>
            </div>
            <button onClick={() => navigate('tickets')} className="text-sm text-blue-600 font-medium">
              Vé của tôi
            </button>
          </div>

          {myTx.length === 0 ? (
            <Empty icon={Wallet} title="Chưa có giao dịch ví" hint="Thanh toán bằng ví khi đặt vé để ghi sổ cái balance_after." />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {myTx.map(tx => (
                <div key={tx.id} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tx.type === 'DEBIT' ? 'Ghi nợ' : 'Ghi có'} · số dư sau: {formatPrice(tx.balanceAfter)}
                    </p>
                  </div>
                  <p className={`font-bold ${tx.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.type === 'DEBIT' ? '-' : '+'}
                    {formatPrice(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vé của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">{myBookings.length} booking</p>
          </div>
          <button onClick={() => navigate('transactions')} className="text-sm text-blue-600 font-medium">
            Lịch sử giao dịch
          </button>
        </div>

        {myBookings.length === 0 ? (
          <Empty
            icon={Ticket}
            title="Chưa có vé nào"
            hint="Đặt chuyến bay để vé và thông tin hành khách xuất hiện tại đây."
          />
        ) : (
          <div className="space-y-3">
            {myBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                open={openId === booking.id}
                onToggle={() => setOpenId(openId === booking.id ? null : booking.id)}
                tickets={tickets.filter(t => t.bookingId === booking.id)}
                passengers={passengers}
                flights={flights}
                flightClasses={flightClasses}
                transactions={transactions.filter(t => t.bookingId === booking.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({
  icon: Icon,
  title,
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  hint: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-blue-300" />
      </div>
      <h2 className="font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500">{hint}</p>
    </div>
  );
}

function BookingCard({
  booking,
  open,
  onToggle,
  tickets,
  passengers,
  flights,
  flightClasses,
  transactions,
}: {
  booking: Booking;
  open: boolean;
  onToggle: () => void;
  tickets: ReturnType<typeof useApp>['tickets'];
  passengers: ReturnType<typeof useApp>['passengers'];
  flights: ReturnType<typeof useApp>['flights'];
  flightClasses: ReturnType<typeof useApp>['flightClasses'];
  transactions: ReturnType<typeof useApp>['transactions'];
}) {
  const firstTicket = tickets[0];
  const flight = flights.find(f => f.id === firstTicket?.flightId);
  const airline = flight ? getAirline(flight.airlineId) : undefined;
  const from = flight ? getAirport(flight.departureCode) : undefined;
  const to = flight ? getAirport(flight.arrivalCode) : undefined;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={onToggle} className="w-full p-5 text-left flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400">Mã đặt vé</p>
          <p className="font-bold text-blue-600 tracking-wide">{booking.code}</p>
          <p className="text-sm text-gray-600 mt-1">
            {from?.city ?? '—'} → {to?.city ?? '—'} · {airline?.name ?? 'Chuyến bay'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(booking.createdAt).toLocaleString('vi-VN')} · {tickets.length} vé ·{' '}
            {booking.paymentMethod === 'wallet' ? 'Ví' : 'Trực tiếp'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">{formatPrice(booking.totalAmount)}</p>
          <p className="text-xs text-green-600 font-medium">{booking.status}</p>
          <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto mt-2 transition ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50">
          {tickets.map(ticket => {
            const pax = passengers.find(p => p.id === ticket.passengerId);
            const fc = flightClasses.find(c => c.id === ticket.classId);
            const tFlight = flights.find(f => f.id === ticket.flightId);
            return (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">Ghế {ticket.seatNumber}</p>
                  <p className="text-sm font-bold text-blue-600">{formatPrice(ticket.price)}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {tFlight?.flightNumber} · {fc ? seatClassLabels[fc.seatClass] : ticket.classId}
                </p>
                {pax && (
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{pax.fullName}</p>
                    <p>
                      {genderLabels[pax.gender]} · {pax.birthDate} · {pax.nationality}
                    </p>
                    <p>
                      {identityTypeLabels[pax.identityType]} · {pax.identityNumber}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {transactions.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Biến động ví
              </p>
              {transactions.map(tx => (
                <p key={tx.id} className="text-sm text-gray-700">
                  -{formatPrice(tx.amount)} · số dư sau (balance_after): {formatPrice(tx.balanceAfter)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
