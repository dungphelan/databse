import { useState, useMemo } from 'react';

import {
  ArrowRight,
  Clock,
  Star,
  Filter,
  X,
  Plane,
  Users,
  Calendar,
  Check,
  Briefcase,
  Search,
  MapPin,
  ChevronDown,
} from 'lucide-react';

import { useApp } from '@/context';

import {
  getAirline,
  getAirport,
  formatPrice,
  airlines,
  airports,
  minClassPrice,
  seatClassLabels,
} from '@/data';

import type {
  Flight,
  FlightClass,
  SeatClass,
} from '@/types';

import AirlineLogo from '@/components/AirlineLogo';

type SortKey =
  | 'cheapest'
  | 'earliest'
  | 'fastest';

export default function ListPage() {
  const {
    flights,
    flightClasses,
    search,
    setSearch,
    navigate,
    selectFlightClass,
    loadFlights,
    multiCityResults,
  } = useApp();

  const [sortKey, setSortKey] =
    useState<SortKey>('cheapest');

  const [selectedAirlines, setSelectedAirlines] =
    useState<string[]>([]);

  const [maxStops, setMaxStops] =
    useState<number>(1);

  const [showFilters, setShowFilters] =
    useState(false);

  const [fromCode, setFromCode] =
    useState(search.fromCode);

  const [toCode, setToCode] =
    useState(search.toCode);

  const [passengers, setPassengers] =
    useState(search.passengers);

  const [departureDate, setDepartureDate] =
    useState(search.departureDate);

  const classesByFlight = useMemo(() => {
    const map =
      new Map<string, FlightClass[]>();

    for (const fc of flightClasses) {
      const list =
        map.get(fc.flightId) ?? [];

      list.push(fc);

      map.set(fc.flightId, list);
    }

    for (const list of map.values()) {
      list.sort(
        (a, b) => a.price - b.price
      );
    }

    return map;
  }, [flightClasses]);

  const filteredFlights = useMemo(() => {
    let result =
      flights.filter(
        f => f.stops <= maxStops
      );

    if (
      selectedAirlines.length > 0
    ) {
      result =
        result.filter(
          f =>
            selectedAirlines.includes(
              f.airlineId
            )
        );
    }

    switch (sortKey) {
      case 'cheapest':
        result = [...result].sort(
          (a, b) => {
            const aMin =
              minClassPrice(
                classesByFlight.get(
                  a.id
                ) ?? []
              );

            const bMin =
              minClassPrice(
                classesByFlight.get(
                  b.id
                ) ?? []
              );

            return aMin - bMin;
          }
        );
        break;

      case 'earliest':
        result = [...result].sort(
          (a, b) =>
            a.departureTime.localeCompare(
              b.departureTime
            )
        );
        break;

      case 'fastest':
        result = [...result].sort(
          (a, b) =>
            parseDuration(
              a.duration
            ) -
            parseDuration(
              b.duration
            )
        );
        break;
    }

    return result;
  }, [
    flights,
    sortKey,
    selectedAirlines,
    maxStops,
    classesByFlight,
  ]);

  function parseDuration(
    d: string
  ): number {
    const match =
      d.match(
        /(\d+)h\s*(\d+)?m?/
      );

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

  const toggleAirline = (
    id: string
  ) => {
    setSelectedAirlines(prev =>
      prev.includes(id)
        ? prev.filter(
            a => a !== id
          )
        : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedAirlines([]);
    setMaxStops(1);
  };

  const handleSelectClass = (
    flight: Flight,
    flightClass: FlightClass
  ) => {
    if (
      flightClass.availableSeats <
      search.passengers
    ) {
      return;
    }

    /*
     * Với nhiều chặng, trước khi vào
     * màn hình ghế, nạp lại đúng chặng
     * đang chọn vào context.
     */
    loadFlights(
      flight.departureCode,
      flight.arrivalCode
    );

    selectFlightClass(
      flight,
      flightClass
    );

    navigate('seat');
  };

  const handleInlineSearch = () => {
    const next = {
      ...search,
      fromCode,
      toCode,
      passengers,
      departureDate,
    };

    setSearch(next);

    loadFlights(
      fromCode,
      toCode
    );
  };

  /*
   * Lọc kết quả của từng chặng
   * nhiều chặng.
   */
  const getFilteredSegmentFlights = (
    segmentFlights: Flight[]
  ) => {
    let result =
      segmentFlights.filter(
        f => f.stops <= maxStops
      );

    if (
      selectedAirlines.length > 0
    ) {
      result =
        result.filter(
          f =>
            selectedAirlines.includes(
              f.airlineId
            )
        );
    }

    switch (sortKey) {
      case 'cheapest':
        result = [...result].sort(
          (a, b) => {
            const aClasses =
              multiCityResults
                .flatMap(r =>
                  r.flightClasses.filter(
                    fc =>
                      fc.flightId ===
                      a.id
                  )
                );

            const bClasses =
              multiCityResults
                .flatMap(r =>
                  r.flightClasses.filter(
                    fc =>
                      fc.flightId ===
                      b.id
                  )
                );

            return (
              minClassPrice(
                aClasses
              ) -
              minClassPrice(
                bClasses
              )
            );
          }
        );
        break;

      case 'earliest':
        result = [...result].sort(
          (a, b) =>
            a.departureTime.localeCompare(
              b.departureTime
            )
        );
        break;

      case 'fastest':
        result = [...result].sort(
          (a, b) =>
            parseDuration(
              a.duration
            ) -
            parseDuration(
              b.duration
            )
        );
        break;
    }

    return result;
  };

  /*
   * NHIỀU CHẶNG
   */
  if (
    search.tripType ===
      'multi-city' &&
    multiCityResults.length > 0
  ) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="bg-white border-b border-gray-100 sticky top-16 z-30">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Chuyến bay nhiều chặng
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {search.passengers} hành khách ·{' '}
                  {search.cabinClass}
                </p>
              </div>

              <button
                onClick={() =>
                  navigate('home')
                }
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100"
              >
                Sửa tìm kiếm
              </button>

            </div>

          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="space-y-8">

            {multiCityResults.map(
              (result, segmentIndex) => {

                const segmentFlights =
                  getFilteredSegmentFlights(
                    result.flights
                  );

                const segmentClasses =
                  new Map<
                    string,
                    FlightClass[]
                  >();

                for (
                  const fc of result.flightClasses
                ) {
                  const list =
                    segmentClasses.get(
                      fc.flightId
                    ) ?? [];

                  list.push(fc);

                  segmentClasses.set(
                    fc.flightId,
                    list
                  );
                }

                for (
                  const list of segmentClasses.values()
                ) {
                  list.sort(
                    (a, b) =>
                      a.price -
                      b.price
                  );
                }

                return (
                  <section
                    key={segmentIndex}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >

                    <div className="flex items-center justify-between mb-5">

                      <div>

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {segmentIndex + 1}
                          </div>

                          <div>

                            <h2 className="font-bold text-gray-900">
                              Chặng {segmentIndex + 1}
                            </h2>

                            <p className="text-sm text-gray-500">
                              {getAirport(
                                result.segment.fromCode
                              )?.city}{' '}
                              ({result.segment.fromCode})
                              {' → '}
                              {getAirport(
                                result.segment.toCode
                              )?.city}{' '}
                              ({result.segment.toCode})
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="text-right">

                        <p className="text-xs text-gray-400">
                          Ngày đi
                        </p>

                        <p className="text-sm font-semibold text-gray-700">
                          {result.segment.departureDate}
                        </p>

                      </div>

                    </div>

                    <div className="space-y-3">

                      {segmentFlights.map(
                        flight => (
                          <FlightCard
                            key={flight.id}
                            flight={flight}
                            classes={
                              segmentClasses.get(
                                flight.id
                              ) ?? []
                            }
                            passengers={
                              search.passengers
                            }
                            onSelectClass={fc =>
                              handleSelectClass(
                                flight,
                                fc
                              )
                            }
                          />
                        )
                      )}

                    </div>

                    {segmentFlights.length ===
                      0 && (
                      <div className="text-center py-10">
                        <p className="text-gray-500">
                          Không tìm thấy chuyến bay phù hợp cho chặng này.
                        </p>
                      </div>
                    )}

                  </section>
                );
              }
            )}

          </div>

        </div>

      </div>
    );
  }

  /*
   * MỘT CHIỀU / KHỨ HỒI
   * GIỮ LOGIC CŨ
   */

  if (flights.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">

        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
          <Plane className="w-10 h-10 text-blue-300" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Chưa có chuyến bay nào
        </h2>

        <p className="text-gray-500 mb-6 text-center max-w-md">
          Vui lòng tìm kiếm lại để xem danh sách chuyến bay phù hợp.
        </p>

        <button
          onClick={() =>
            navigate('home')
          }
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
        >
          Tìm chuyến bay
        </button>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">

            <div>

              <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                Điểm đi
              </label>

              <div className="relative">

                <select
                  value={fromCode}
                  onChange={e =>
                    setFromCode(
                      e.target.value
                    )
                  }
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50"
                >
                  {airports.map(a => (
                    <option
                      key={a.code}
                      value={a.code}
                    >
                      {a.city} ({a.code})
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

              </div>

            </div>

            <div>

              <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                Điểm đến
              </label>

              <div className="relative">

                <select
                  value={toCode}
                  onChange={e =>
                    setToCode(
                      e.target.value
                    )
                  }
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50"
                >
                  {airports.map(a => (
                    <option
                      key={a.code}
                      value={a.code}
                    >
                      {a.city} ({a.code})
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

              </div>

            </div>

            <div>

              <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Ngày đi
              </label>

              <input
                type="date"
                value={departureDate}
                onChange={e =>
                  setDepartureDate(
                    e.target.value
                  )
                }
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50"
              />

            </div>

            <div>

              <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
                <Users className="w-3.5 h-3.5" />
                Hành khách
              </label>

              <input
                type="number"
                min="1"
                value={passengers}
                onChange={e => {
                  const n = Number(e.target.value);

                  if (n >= 1) {
                    setPassengers(n);

                    setSearch({
                      ...search,
                      passengers: n,
                    });
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50"
                placeholder="Nhập số người"
              />

            </div>

            <button
              onClick={handleInlineSearch}
              className="h-[42px] rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              <Search className="w-4 h-4" />
              Tìm kiếm
            </button>

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="flex gap-6">

          <aside className="hidden lg:block w-72 flex-shrink-0">

            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-44">

              <div className="flex items-center justify-between mb-5">

                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </h3>

                <button
                  onClick={
                    clearFilters
                  }
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xóa tất cả
                </button>

              </div>

              <div className="mb-6">

                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Số điểm dừng
                </h4>

                <div className="space-y-2">

                  {[
                    {
                      label: 'Bay thẳng',
                      value: 0,
                    },
                    {
                      label:
                        'Tối đa 1 điểm dừng',
                      value: 1,
                    },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >

                      <button
                        onClick={() =>
                          setMaxStops(
                            opt.value
                          )
                        }
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          maxStops ===
                          opt.value
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300 group-hover:border-blue-400'
                        }`}
                      >
                        {maxStops ===
                          opt.value && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>

                      <span className="text-sm text-gray-600">
                        {opt.label}
                      </span>

                    </label>
                  ))}

                </div>

              </div>

              <div>

                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Hãng hàng không
                </h4>

                <div className="space-y-2.5">

                  {airlines.map(
                    airline => (
                      <label
                        key={airline.id}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >

                        <button
                          onClick={() =>
                            toggleAirline(
                              airline.id
                            )
                          }
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedAirlines.includes(
                              airline.id
                            )
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300 group-hover:border-blue-400'
                          }`}
                        >
                          {selectedAirlines.includes(
                            airline.id
                          ) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>

                        <span className="text-sm text-gray-600">
                          {airline.name}
                        </span>

                      </label>
                    )
                  )}

                </div>

              </div>

            </div>

          </aside>

          <div className="flex-1 min-w-0">

            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">

              <div className="flex gap-2">

                {[
                  {
                    id: 'cheapest',
                    label: 'Rẻ nhất',
                  },
                  {
                    id: 'earliest',
                    label: 'Sớm nhất',
                  },
                  {
                    id: 'fastest',
                    label: 'Nhanh nhất',
                  },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setSortKey(
                        tab.id as SortKey
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortKey ===
                      tab.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

              </div>

              <button
                onClick={() =>
                  setShowFilters(true)
                }
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
              </button>

            </div>

            <p className="text-sm text-gray-500 mb-4">
              Tìm thấy{' '}
              <span className="font-semibold text-gray-900">
                {filteredFlights.length}
              </span>{' '}
              chuyến bay ·{' '}
              {search.passengers}{' '}
              hành khách
            </p>

            <div className="space-y-3">

              {filteredFlights.map(
                flight => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    classes={
                      classesByFlight.get(
                        flight.id
                      ) ?? []
                    }
                    passengers={
                      search.passengers
                    }
                    onSelectClass={fc =>
                      handleSelectClass(
                        flight,
                        fc
                      )
                    }
                  />
                )
              )}

            </div>

            {filteredFlights.length ===
              0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

                <p className="text-gray-500 mb-2">
                  Không tìm thấy chuyến bay phù hợp với bộ lọc.
                </p>

                <button
                  onClick={
                    clearFilters
                  }
                  className="text-blue-600 font-medium text-sm"
                >
                  Xóa bộ lọc
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 flex">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setShowFilters(false)
            }
          />

          <div className="relative w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-5 animate-slide-in">

            <div className="flex items-center justify-between mb-5">

              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Bộ lọc
              </h3>

              <button
                onClick={() =>
                  setShowFilters(false)
                }
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

            </div>

            <div className="mb-6">

              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Số điểm dừng
              </h4>

              {[
                {
                  label: 'Bay thẳng',
                  value: 0,
                },
                {
                  label:
                    'Tối đa 1 điểm dừng',
                  value: 1,
                },
              ].map(opt => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 cursor-pointer mb-2"
                >

                  <button
                    onClick={() =>
                      setMaxStops(
                        opt.value
                      )
                    }
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      maxStops ===
                      opt.value
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {maxStops ===
                      opt.value && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>

                  <span className="text-sm text-gray-600">
                    {opt.label}
                  </span>

                </label>
              ))}

            </div>

            <div className="mb-6">

              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Hãng hàng không
              </h4>

              {airlines.map(
                airline => (
                  <label
                    key={airline.id}
                    className="flex items-center gap-2.5 cursor-pointer mb-2"
                  >

                    <button
                      onClick={() =>
                        toggleAirline(
                          airline.id
                        )
                      }
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedAirlines.includes(
                          airline.id
                        )
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAirlines.includes(
                        airline.id
                      ) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>

                    <span className="text-sm text-gray-600">
                      {airline.name}
                    </span>

                  </label>
                )
              )}

            </div>

            <button
              onClick={() =>
                setShowFilters(false)
              }
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold"
            >
              Áp dụng bộ lọc
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

function FlightCard({
  flight,
  classes,
  passengers,
  onSelectClass,
}: {
  flight: Flight;
  classes: FlightClass[];
  passengers: number;
  onSelectClass: (
    fc: FlightClass
  ) => void;
}) {
  const airline =
    getAirline(
      flight.airlineId
    );

  const fromAirport =
    getAirport(
      flight.departureCode
    );

  const toAirport =
    getAirport(
      flight.arrivalCode
    );

  const fromPrice =
    minClassPrice(classes);

  const classTone: Record<
    SeatClass,
    string
  > = {
    Economy:
      'border-gray-200 hover:border-blue-400',

    Business:
      'border-indigo-200 hover:border-indigo-400 bg-indigo-50/40',

    VIP:
      'border-amber-200 hover:border-amber-400 bg-amber-50/50',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all overflow-hidden">

      <div className="p-5">

        <div className="flex items-center gap-3 mb-4">

          {airline && (
            <AirlineLogo
              airline={airline}
            />
          )}

          <div>

            <p className="font-semibold text-gray-900 text-sm">
              {airline?.name}
            </p>

            <div className="flex items-center gap-1.5">

              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />

              <span className="text-xs text-gray-500">
                {airline?.rating}
              </span>

              <span className="text-gray-300 mx-0.5">
                ·
              </span>

              <span className="text-xs text-gray-500">
                {flight.flightNumber}
              </span>

              <span className="text-gray-300 mx-0.5">
                ·
              </span>

              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {flight.baggage}
              </span>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-4 mb-5">

          <div className="text-left">

            <p className="text-2xl font-bold text-gray-900">
              {flight.departureTime}
            </p>

            <p className="text-sm text-gray-500">
              {fromAirport?.city}
            </p>

            <p className="text-xs text-gray-400">
              {flight.departureCode}
            </p>

          </div>

          <div className="flex-1 flex flex-col items-center px-2">

            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">

              <Clock className="w-3.5 h-3.5" />

              {flight.duration}

            </div>

            <div className="relative w-full flex items-center">

              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>

              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 relative">

                <Plane className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 text-blue-500 bg-white rounded-full p-0.5" />

              </div>

              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>

            </div>

            <p className="text-xs text-gray-400 mt-1">

              {flight.stops === 0
                ? 'Bay thẳng'
                : `1 điểm dừng tại ${flight.stopCities.join(
                    ', '
                  )}`}

            </p>

          </div>

          <div className="text-right">

            <p className="text-2xl font-bold text-gray-900">
              {flight.arrivalTime}
            </p>

            <p className="text-sm text-gray-500">
              {toAirport?.city}
            </p>

            <p className="text-xs text-gray-400">
              {flight.arrivalCode}
            </p>

          </div>

        </div>

        <div className="flex items-center justify-between mb-3">

          <p className="text-xs text-gray-500">
            Hạng vé & giá niêm yết (VND)
          </p>

          <p className="text-xs text-gray-400">
            Từ{' '}
            <span className="font-semibold text-blue-600">
              {formatPrice(fromPrice)}
            </span>
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {classes.map(fc => {

            const notEnough =
              fc.availableSeats <
              passengers;

            return (
              <button
                key={fc.id}
                disabled={notEnough}
                onClick={() =>
                  onSelectClass(fc)
                }
                className={`text-left rounded-xl border p-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${classTone[fc.seatClass]}`}
              >

                <div className="flex items-center justify-between mb-1">

                  <span className="text-sm font-semibold text-gray-900">
                    {seatClassLabels[
                      fc.seatClass
                    ]}
                  </span>

                  <ArrowRight className="w-4 h-4 text-gray-400" />

                </div>

                <p className="text-lg font-bold text-blue-600">
                  {formatPrice(fc.price)}
                </p>

                <p className="text-xs text-gray-500 mt-1">

                  {notEnough
                    ? 'Không đủ ghế'
                    : `Còn ${fc.availableSeats} ghế`}

                </p>

              </button>
            );
          })}

        </div>

      </div>

    </div>
  );
}
