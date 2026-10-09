import { useMemo } from 'react';
import { ArrowLeft, Plane } from 'lucide-react';
import { useApp } from '@/context';
import {
  getAirline,
  getAirport,
  formatPrice,
  getSeatLayout,
  seatClassLabels,
} from '@/data';

export default function SeatSelection() {
  const {
    selectedFlight,
    selectedClass,
    selectedSeats,
    setSelectedSeats,
    occupiedSeatsForClass,
    search,
    navigate,
  } = useApp();

  const occupied = useMemo(
    () =>
      selectedClass
        ? occupiedSeatsForClass(selectedClass.id)
        : [],
    [selectedClass, occupiedSeatsForClass]
  );

  if (!selectedFlight || !selectedClass) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
          <Plane className="w-10 h-10 text-blue-300" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Chưa chọn hạng vé
        </h2>

        <p className="text-gray-500 mb-6 text-center">
          Vui lòng chọn chuyến bay và hạng vé trước.
        </p>

        <button
          onClick={() => navigate('list')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold"
        >
          Về danh sách chuyến bay
        </button>
      </div>
    );
  }

  const layout = getSeatLayout(selectedClass.seatClass);
  const needed = search.passengers;

  const airline = getAirline(selectedFlight.airlineId);
  const fromAirport = getAirport(selectedFlight.departureCode);
  const toAirport = getAirport(selectedFlight.arrivalCode);

  const toggleSeat = (seatId: string) => {
    if (occupied.includes(seatId)) {
      return;
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(
        selectedSeats.filter((s) => s !== seatId)
      );
      return;
    }

    if (selectedSeats.length >= needed) {
      setSelectedSeats([
        ...selectedSeats.slice(1),
        seatId,
      ]);
      return;
    }

    setSelectedSeats([
      ...selectedSeats,
      seatId,
    ]);
  };

  const tone =
    selectedClass.seatClass === 'VIP'
      ? 'bg-amber-500 text-white hover:bg-amber-600'
      : selectedClass.seatClass === 'Business'
        ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
        : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Thông tin chuyến bay */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Chọn ghế
          </h2>

          <p className="text-gray-500 mt-2">
            {airline?.name} · {selectedFlight.flightNumber} ·{' '}
            {fromAirport?.city} → {toAirport?.city}
          </p>

          <p className="text-sm text-blue-600 font-medium mt-1">
            Hạng {seatClassLabels[selectedClass.seatClass]} · chọn{' '}
            {needed} ghế ({selectedSeats.length}/{needed})
          </p>
        </div>

        {/* Chú thích */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex flex-wrap justify-center gap-6">

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-gray-200"></span>
              <span className="text-sm text-gray-600">
                Ghế trống
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-blue-600"></span>
              <span className="text-sm text-gray-600">
                Đang chọn
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-gray-500"></span>
              <span className="text-sm text-gray-600">
                Đã đặt
              </span>
            </div>

          </div>
        </div>

        {/* Sơ đồ ghế */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">

          {/* Đầu máy bay */}
          <div className="text-center mb-6">
            <div className="inline-block px-8 py-3 rounded-t-3xl bg-gray-100 text-gray-500 font-semibold">
              ĐẦU MÁY BAY ·{' '}
              {seatClassLabels[selectedClass.seatClass]}
            </div>
          </div>

          <div className="space-y-3">

            {Array.from(
              { length: layout.rows },
              (_, i) => layout.startRow + i
            ).map((row) => (

              <div
                key={row}
                className="flex items-center justify-center gap-2"
              >

                {/* Số hàng */}
                <div className="w-8 text-center text-sm font-semibold text-gray-400">
                  {row}
                </div>

                {/* Các ghế trong hàng */}
                {layout.letters.map((letter, idx) => {
                  const seatId = `${row}${letter}`;

                  const isOccupied =
                    occupied.includes(seatId);

                  const isSelected =
                    selectedSeats.includes(seatId);

                  return (
                    <span
                      key={seatId}
                      className="contents"
                    >

                      {/* Lối đi */}
                      {idx === layout.aisleAfterIndex + 1 && (
                        <div className="w-6" />
                      )}

                      <button
                        type="button"
                        disabled={isOccupied}
                        onClick={() => toggleSeat(seatId)}
                        className={`w-12 h-12 rounded-lg text-sm font-semibold transition-all ${
                          isOccupied
                            ? 'bg-gray-500 text-white cursor-not-allowed'
                            : isSelected
                              ? 'bg-blue-600 text-white shadow-lg scale-105'
                              : tone
                        }`}
                      >
                        {seatId}
                      </button>

                    </span>
                  );
                })}

              </div>

            ))}

          </div>

          {/* Đuôi máy bay */}
          <div className="text-center mt-6">
            <div className="inline-block px-8 py-3 rounded-b-3xl bg-gray-100 text-gray-500 font-semibold">
              ĐUÔI KHOANG
            </div>
          </div>

        </div>

        {/* Thông tin ghế đã chọn */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">

          {selectedSeats.length > 0 ? (

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  Ghế đã chọn
                </p>

                <p className="text-xl font-bold text-gray-900">
                  {selectedSeats.join(', ')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Tạm tính vé
                </p>

                <p className="text-xl font-bold text-blue-600">
                  {formatPrice(
                    selectedClass.price * needed
                  )}
                </p>
              </div>

            </div>

          ) : (

            <p className="text-center text-gray-500">
              Chọn {needed} ghế cho {needed} hành khách
            </p>

          )}

        </div>

        {/* Nút điều hướng */}
        <div className="flex justify-between mt-6 gap-4">

          <button
            type="button"
            onClick={() => navigate('list')}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          <button
            type="button"
            onClick={() => navigate('booking')}
            disabled={selectedSeats.length !== needed}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
          >
            Tiếp tục
          </button>

        </div>

      </div>
    </div>
  );
}