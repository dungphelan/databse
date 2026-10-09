import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Plane,
  Clock,
  Star,
  Briefcase,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Wallet,
  Shield,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/context';
import {
  getAirline,
  getAirport,
  formatPrice,
  seatClassLabels,
  identityTypeLabels,
  genderLabels,
  uid,
} from '@/data';
import type { Gender, IdentityType, Passenger, PaymentMethod } from '@/types';
import AirlineLogo from '@/components/AirlineLogo';

type Step = 'form' | 'review' | 'done';

function emptyPassenger(): Passenger {
  return {
    id: uid('pax'),
    fullName: '',
    birthDate: '',
    gender: 'MALE',
    identityType: 'ID_CARD',
    identityNumber: '',
    nationality: 'Việt Nam',
  };
}

export default function BookingPage() {
  const {
    selectedFlight,
    selectedClass,
    selectedSeats,
    search,
    navigate,
    confirmBooking,
    user,
  } = useApp();

  const [step, setStep] = useState<Step>('form');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('direct');
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [contactPhone, setContactPhone] = useState('');
  const [paxList, setPaxList] = useState<Passenger[]>(() =>
    Array.from({ length: Math.max(1, search.passengers) }, emptyPassenger)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payError, setPayError] = useState('');
  const [bookingCode, setBookingCode] = useState('');

  const paxCount = search.passengers;

  useEffect(() => {
    setPaxList(prev => {
      if (prev.length === paxCount) return prev;
      if (prev.length < paxCount) {
        return [...prev, ...Array.from({ length: paxCount - prev.length }, emptyPassenger)];
      }
      return prev.slice(0, paxCount);
    });
  }, [paxCount]);

  if (!selectedFlight || !selectedClass) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
          <Plane className="w-10 h-10 text-blue-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa chọn chuyến bay</h2>
        <p className="text-gray-500 mb-6 text-center">Vui lòng chọn chuyến bay để tiếp tục đặt vé.</p>
        <button
          onClick={() => navigate('home')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-200"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const airline = getAirline(selectedFlight.airlineId);
  const fromAirport = getAirport(selectedFlight.departureCode);
  const toAirport = getAirport(selectedFlight.arrivalCode);
  const subtotal = selectedClass.price * paxCount;
  const taxAndFees = Math.round(subtotal * 0.1);
  const total = subtotal + taxAndFees;

  const updatePax = (index: number, patch: Partial<Passenger>) => {
    setPaxList(prev => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!contactEmail.trim()) e.contactEmail = 'Vui lòng nhập email liên hệ';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) e.contactEmail = 'Email không hợp lệ';
    if (!contactPhone.trim()) e.contactPhone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9+\s-]{8,15}$/.test(contactPhone)) e.contactPhone = 'Số điện thoại không hợp lệ';

    paxList.forEach((p, i) => {
      if (!p.fullName.trim()) e[`fullName-${i}`] = 'Vui lòng nhập họ tên';
      if (!p.birthDate) e[`birthDate-${i}`] = 'Vui lòng chọn ngày sinh';
      if (!p.identityNumber.trim()) e[`identityNumber-${i}`] = 'Vui lòng nhập số giấy tờ';
      if (!p.nationality.trim()) e[`nationality-${i}`] = 'Vui lòng nhập quốc tịch';
    });
    if (selectedSeats.length !== paxCount) e.seats = 'Chưa chọn đủ ghế';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goReview = () => {
    if (validate()) {
      setStep('review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePay = () => {
    setPayError('');
    const result = confirmBooking({
      passengers: paxList,
      contact: { email: contactEmail, phone: contactPhone },
      paymentMethod,
    });
    if (result.error) {
      setPayError(result.error);
      return;
    }
    setBookingCode(result.booking?.code ?? '');
    setStep('done');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt vé thành công!</h1>
          <p className="text-gray-500 mb-6">Mã đặt vé đã được ghi nhận. Bạn có thể xem chi tiết trong Vé của tôi.</p>

          <div className="bg-blue-50 rounded-2xl p-5 mb-6">
            <p className="text-xs text-gray-500 mb-1">Mã đặt vé</p>
            <p className="text-2xl font-bold text-blue-600 tracking-wider">{bookingCode}</p>
          </div>

          <div className="text-left bg-gray-50 rounded-2xl p-5 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Chuyến bay</span>
              <span className="font-semibold text-gray-900">{fromAirport?.city} → {toAirport?.city}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hạng vé</span>
              <span className="font-semibold text-gray-900">{seatClassLabels[selectedClass.seatClass]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ghế</span>
              <span className="font-semibold text-gray-900">{selectedSeats.join(', ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Thanh toán</span>
              <span className="font-semibold text-gray-900">
                {paymentMethod === 'wallet' ? 'Ví điện tử' : 'Trực tiếp'}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-500">Tổng tiền</span>
              <span className="font-bold text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('tickets')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-xl transition-all mb-2"
          >
            Xem vé của tôi
          </button>
          <button
            onClick={() => navigate('home')}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button onClick={() => navigate('home')} className="hover:text-blue-600">Trang chủ</button>
            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            <button onClick={() => navigate('list')} className="hover:text-blue-600">Chuyến bay</button>
            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            <button onClick={() => navigate('seat')} className="hover:text-blue-600">Chọn ghế</button>
            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            <span className="text-gray-900 font-medium">{step === 'review' ? 'Xác nhận' : 'Thông tin'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-sky-50/30">
                {airline && <AirlineLogo airline={airline} />}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{airline?.name}</p>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-gray-500">{airline?.rating}</span>
                    <span className="text-gray-300 mx-0.5">·</span>
                    <span className="text-xs text-gray-500">{selectedFlight.flightNumber}</span>
                    <span className="text-gray-300 mx-0.5">·</span>
                    <span className="text-xs text-blue-600 font-medium">
                      {seatClassLabels[selectedClass.seatClass]}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{selectedFlight.departureTime}</p>
                    <p className="text-sm text-gray-500">{fromAirport?.city}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-4">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedFlight.duration}
                    </div>
                    <div className="relative w-full flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 relative">
                        <Plane className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 text-blue-500 bg-white rounded-full p-0.5" />
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{selectedFlight.arrivalTime}</p>
                    <p className="text-sm text-gray-500">{toAirport?.city}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(search.departureDate)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <User className="w-3.5 h-3.5" />
                    {paxCount} hành khách
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    Ghế {selectedSeats.join(', ') || '—'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Briefcase className="w-3.5 h-3.5" />
                    {selectedFlight.baggage}
                  </div>
                </div>
              </div>
            </div>

            {step === 'form' && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-sm flex items-center justify-center font-bold">1</span>
                    Liên hệ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          className={`w-full pl-10 pr-3 py-3 rounded-xl border ${errors.contactEmail ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        />
                      </div>
                      {errors.contactEmail && <p className="text-xs text-red-500 mt-1">{errors.contactEmail}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={e => setContactPhone(e.target.value)}
                          className={`w-full pl-10 pr-3 py-3 rounded-xl border ${errors.contactPhone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        />
                      </div>
                      {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
                    </div>
                  </div>
                </div>

                {paxList.map((pax, i) => (
                  <div key={pax.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Hành khách {i + 1} · ghế {selectedSeats[i] || '—'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                        <input
                          type="text"
                          value={pax.fullName}
                          onChange={e => updatePax(i, { fullName: e.target.value })}
                          placeholder="Nguyễn Văn A"
                          className={`w-full px-3 py-3 rounded-xl border ${errors[`fullName-${i}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        />
                        {errors[`fullName-${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`fullName-${i}`]}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày sinh</label>
                        <input
                          type="date"
                          value={pax.birthDate}
                          onChange={e => updatePax(i, { birthDate: e.target.value })}
                          className={`w-full px-3 py-3 rounded-xl border ${errors[`birthDate-${i}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Giới tính</label>
                        <select
                          value={pax.gender}
                          onChange={e => updatePax(i, { gender: e.target.value as Gender })}
                          className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white"
                        >
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại giấy tờ</label>
                        <select
                          value={pax.identityType}
                          onChange={e => updatePax(i, { identityType: e.target.value as IdentityType })}
                          className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white"
                        >
                          <option value="ID_CARD">CCCD / CMND</option>
                          <option value="PASSPORT">Hộ chiếu</option>
                          <option value="DRIVER_LICENSE">GPLX</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Số giấy tờ</label>
                        <input
                          type="text"
                          value={pax.identityNumber}
                          onChange={e => updatePax(i, { identityNumber: e.target.value })}
                          className={`w-full px-3 py-3 rounded-xl border ${errors[`identityNumber-${i}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Quốc tịch</label>
                        <input
                          type="text"
                          value={pax.nationality}
                          onChange={e => updatePax(i, { nationality: e.target.value })}
                          className={`w-full px-3 py-3 rounded-xl border ${errors[`nationality-${i}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {step === 'review' && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Xác nhận thông tin hành khách</h3>
                  <div className="space-y-4">
                    {paxList.map((pax, i) => (
                      <div key={pax.id} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                        <p className="font-semibold text-gray-900">{pax.fullName} · ghế {selectedSeats[i]}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {genderLabels[pax.gender]} · {formatDate(pax.birthDate)} · {pax.nationality}
                        </p>
                        <p className="text-sm text-gray-500">
                          {identityTypeLabels[pax.identityType]} · {pax.identityNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Liên hệ: {contactEmail} · {contactPhone}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Phương thức thanh toán</h3>
                  <div className="space-y-3">
                    <PaymentOption
                      title="Thanh toán trực tiếp"
                      desc="Thanh toán tại quầy vé hoặc đại lý"
                      icon={CreditCard}
                      selected={paymentMethod === 'direct'}
                      onSelect={() => setPaymentMethod('direct')}
                    />
                    <PaymentOption
                      title="Ví điện tử SkyTicket"
                      desc={user ? `Số dư hiện tại: ${formatPrice(user.walletBalance)}` : 'Đăng nhập để thanh toán bằng ví'}
                      icon={Wallet}
                      selected={paymentMethod === 'wallet'}
                      onSelect={() => setPaymentMethod('wallet')}
                    />
                  </div>
                  {paymentMethod === 'wallet' && user && (
                    <p className="mt-3 text-sm text-gray-600">
                      Sau thanh toán, số dư dự kiến:{' '}
                      <span className="font-semibold text-blue-600">
                        {formatPrice(user.walletBalance - total)}
                      </span>
                    </p>
                  )}
                  {payError && <p className="mt-3 text-sm text-red-600">{payError}</p>}
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="w-4 h-4 text-green-500" />
                    Giao dịch được ghi sổ cái ví với trường balance_after.
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <h3 className="font-bold text-gray-900 mb-4">Chi tiết hóa đơn (VND)</h3>
              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {seatClassLabels[selectedClass.seatClass]} x {paxCount}
                  </span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Giá mỗi vé</span>
                  <span className="font-medium text-gray-900">{formatPrice(selectedClass.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Thuế và phí</span>
                  <span className="font-medium text-gray-900">{formatPrice(taxAndFees)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí dịch vụ</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 mb-5">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">{formatPrice(total)}</span>
              </div>

              {step === 'form' ? (
                <button
                  onClick={goReview}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Xem lại & xác nhận
                </button>
              ) : (
                <button
                  onClick={handlePay}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  Thanh toán
                </button>
              )}

              <button
                onClick={() => (step === 'review' ? setStep('form') : navigate('seat'))}
                className="w-full mt-2 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({
  title,
  desc,
  icon: Icon,
  selected,
  onSelect,
}: {
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
        selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-blue-600' : 'bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-gray-500'}`} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
