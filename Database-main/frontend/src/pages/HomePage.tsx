import { useState } from 'react';

import {
  Search,
  ArrowRight,
  Calendar,
  Users,
  Plane,
  MapPin,
  ChevronDown,
  Star,
  Clock,
  Shield,
  Tag,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';

import { useApp } from '@/context';

import {
  airports,
  cabinClasses,
  airlines,
  formatPrice,
} from '@/data';

import type {
  SearchCriteria,
  SeatClass,
  MultiCitySegment,
} from '@/types';

import AirlineLogo from '@/components/AirlineLogo';

export default function HomePage() {
  const {
    search,
    setSearch,
    navigate,
    loadFlights,
    loadMultiCityFlights,
  } = useApp();

  const [tripType, setTripType] = useState<
    'one-way' | 'round-trip' | 'multi-city'
  >(search.tripType);

  const [fromCode, setFromCode] =
    useState(search.fromCode);

  const [toCode, setToCode] =
    useState(search.toCode);

  const [departureDate, setDepartureDate] =
    useState(
      search.departureDate ||
        getDefaultDate()
    );

  const [returnDate, setReturnDate] =
    useState(
      search.returnDate ||
        getDefaultDate(7)
    );

  const [passengers, setPassengers] =
    useState(search.passengers);

  const [cabinClass, setCabinClass] =
    useState<SeatClass>(
      search.cabinClass
    );

  const [searchError, setSearchError] = useState('');

  const [multiCitySegments, setMultiCitySegments] =
    useState<MultiCitySegment[]>(() => {
      if (
        search.multiCitySegments &&
        search.multiCitySegments.length >= 2
      ) {
        return search.multiCitySegments;
      }

      return [
        {
          fromCode: search.fromCode || 'SGN',
          toCode: search.toCode || 'DAD',
          departureDate:
            search.departureDate ||
            getDefaultDate(),
        },
        {
          fromCode: search.toCode || 'DAD',
          toCode: 'HAN',
          departureDate:
            getDefaultDate(3),
        },
      ];
    });

  function getDefaultDate(offset = 0): string {
    const d = new Date();

    d.setDate(
      d.getDate() + 14 + offset
    );

    return d.toISOString().split('T')[0];
  }

  const swapCities = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const changeTripType = (
    type:
      | 'one-way'
      | 'round-trip'
      | 'multi-city'
  ) => {
    setTripType(type);

    if (type === 'multi-city') {
      setMultiCitySegments(prev => {
        if (prev.length >= 2) {
          return prev;
        }

        return [
          {
            fromCode,
            toCode,
            departureDate,
          },
          {
            fromCode: toCode,
            toCode: 'HAN',
            departureDate:
              getDefaultDate(3),
          },
        ];
      });
    }
  };

  const updateMultiCitySegment = (
    index: number,
    field: keyof MultiCitySegment,
    value: string
  ) => {
    setMultiCitySegments(prev => {
      const next = prev.map(segment => ({
        ...segment,
      }));

      next[index][field] = value;

      /*
       * Chặng sau luôn bắt đầu
       * từ điểm đến của chặng trước.
       */
      if (
        field === 'toCode' &&
        index + 1 < next.length
      ) {
        next[index + 1].fromCode =
          value;
      }

      /*
       * Nếu đổi điểm đi của một chặng,
       * chặng trước sẽ tự đổi điểm đến.
       */
      if (
        field === 'fromCode' &&
        index > 0
      ) {
        next[index - 1].toCode =
          value;
      }

      return next;
    });
  };

  const addMultiCitySegment = () => {
    setMultiCitySegments(prev => {
      const last = prev[prev.length - 1];

      return [
        ...prev,
        {
          fromCode: last.toCode,
          toCode:
            airports.find(
              airport =>
                airport.code !==
                last.toCode
            )?.code || 'HAN',
          departureDate:
            getDefaultDate(
              prev.length + 1
            ),
        },
      ];
    });
  };

  const removeMultiCitySegment = (
    index: number
  ) => {
    if (multiCitySegments.length <= 2) {
      return;
    }

    setMultiCitySegments(prev => {
      const next = prev.filter(
        (_, i) => i !== index
      );

      /*
       * Nối lại chuỗi sau khi xóa.
       */
      for (
        let i = 1;
        i < next.length;
        i++
      ) {
        next[i].fromCode =
          next[i - 1].toCode;
      }

      return next;
    });
  };

  const handleSearch = () => {
    setSearchError('');

    if (tripType === 'multi-city') {
      const validSegments =
        multiCitySegments.filter(
          segment =>
            segment.fromCode &&
            segment.toCode &&
            segment.departureDate
        );

      if (validSegments.length < 2) {
        setSearchError('Vui lòng chọn đầy đủ thông tin cho ít nhất 2 chặng bay.');
        return;
      }

      for (const seg of validSegments) {
        if (seg.fromCode === seg.toCode) {
          setSearchError('Điểm đi và điểm đến của từng chặng không được trùng nhau.');
          return;
        }
      }

      const criteria: SearchCriteria = {
        fromCode:
          validSegments[0].fromCode,

        toCode:
          validSegments[
            validSegments.length - 1
          ].toCode,

        departureDate:
          validSegments[0].departureDate,

        returnDate: '',

        passengers,

        cabinClass,

        tripType: 'multi-city',

        multiCitySegments:
          validSegments,
      };

      setSearch(criteria);

      loadMultiCityFlights(
        validSegments
      );

      navigate('list');

      return;
    }

    if (fromCode === toCode) {
      setSearchError('Điểm đi và điểm đến không được trùng nhau.');
      return;
    }

    if (tripType === 'round-trip' && returnDate && returnDate < departureDate) {
      setSearchError('Ngày về không thể trước ngày khởi hành.');
      return;
    }

    const criteria: SearchCriteria = {
      fromCode,
      toCode,
      departureDate,

      returnDate:
        tripType === 'round-trip'
          ? returnDate
          : '',

      passengers,
      cabinClass,
      tripType,
    };

    setSearch(criteria);

    loadFlights(
      fromCode,
      toCode
    );

    navigate('list');
  };

  const popularRoutes = [
    {
      from: 'SGN',
      to: 'HAN',
      label: 'TP.HCM → Hà Nội',
      price: 1850000,
    },
    {
      from: 'SGN',
      to: 'DAD',
      label: 'TP.HCM → Đà Nẵng',
      price: 1250000,
    },
    {
      from: 'HAN',
      to: 'PQC',
      label: 'Hà Nội → Phú Quốc',
      price: 2200000,
    },
    {
      from: 'SGN',
      to: 'DLI',
      label: 'TP.HCM → Đà Lạt',
      price: 1400000,
    },
  ];

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">

        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/1493756/pexels-photo-1493756.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/70"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">

          <div className="text-center mb-10 max-w-2xl mx-auto">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-5">
              <Star className="w-4 h-4 fill-current" />
              Được tin dùng bởi hàng triệu hành khách
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Bay đi khám phá
              <br />
              thế giới rộng mở
            </h1>

            <p className="text-lg text-gray-600">
              Tìm và đặt chuyến bay phù hợp nhất với giá tốt nhất, nhanh chóng và dễ dàng.
            </p>

          </div>

          {/* Search Card */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl shadow-blue-100 overflow-hidden">

            {/* Trip Type Tabs */}
            <div className="flex border-b border-gray-100">

              <button
                onClick={() =>
                  changeTripType('one-way')
                }
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-semibold transition-colors relative ${
                  tripType === 'one-way'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Một chiều

                {tripType === 'one-way' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>

              <button
                onClick={() =>
                  changeTripType('round-trip')
                }
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-semibold transition-colors relative ${
                  tripType === 'round-trip'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Khứ hồi

                {tripType === 'round-trip' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>

              <button
                onClick={() =>
                  changeTripType('multi-city')
                }
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-semibold transition-colors relative ${
                  tripType === 'multi-city'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Nhiều chặng

                {tripType === 'multi-city' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>

            </div>

            <div className="p-5 sm:p-6">

              {/* MULTI CITY */}
              {tripType === 'multi-city' ? (

                <div>

                  <div className="space-y-4">

                    {multiCitySegments.map(
                      (segment, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-gray-200 p-4 bg-gray-50/70"
                        >

                          <div className="flex items-center justify-between mb-4">

                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                                {index + 1}
                              </div>

                              <span className="font-semibold text-gray-900">
                                Chặng {index + 1}
                              </span>
                            </div>

                            {multiCitySegments.length > 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeMultiCitySegment(index)
                                }
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                                title="Xóa chặng"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}

                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* FROM */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                <Plane className="w-3.5 h-3.5" />
                                Nơi đi
                              </label>

                              <div className="relative">

                                <select
                                  value={segment.fromCode}
                                  onChange={e =>
                                    updateMultiCitySegment(
                                      index,
                                      'fromCode',
                                      e.target.value
                                    )
                                  }
                                  disabled={index > 0}
                                  className="w-full appearance-none pl-10 pr-8 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white disabled:bg-gray-100 disabled:text-gray-500"
                                >
                                  {airports.map(
                                    airport => (
                                      <option
                                        key={airport.code}
                                        value={airport.code}
                                      >
                                        {airport.city} ({airport.code}) - {airport.country}
                                      </option>
                                    )
                                  )}
                                </select>

                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                              </div>
                            </div>

                            {/* TO */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                <MapPin className="w-3.5 h-3.5" />
                                Nơi đến
                              </label>

                              <div className="relative">

                                <select
                                  value={segment.toCode}
                                  onChange={e =>
                                    updateMultiCitySegment(
                                      index,
                                      'toCode',
                                      e.target.value
                                    )
                                  }
                                  className="w-full appearance-none pl-10 pr-8 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white"
                                >
                                  {airports.map(
                                    airport => (
                                      <option
                                        key={airport.code}
                                        value={airport.code}
                                      >
                                        {airport.city} ({airport.code}) - {airport.country}
                                      </option>
                                    )
                                  )}
                                </select>

                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                              </div>
                            </div>

                            {/* DATE */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                <Calendar className="w-3.5 h-3.5" />
                                Ngày đi
                              </label>

                              <div className="relative">

                                <input
                                  type="date"
                                  value={segment.departureDate}
                                  onChange={e =>
                                    updateMultiCitySegment(
                                      index,
                                      'departureDate',
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                />

                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                              </div>
                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={addMultiCitySegment}
                    className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm chặng
                  </button>

                </div>

              ) : (

                /* ONE WAY + ROUND TRIP */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* From */}
                    <div className="relative">

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        <Plane className="w-3.5 h-3.5" />
                        Nơi đi
                      </label>

                      <div className="relative">

                        <select
                          value={fromCode}
                          onChange={e =>
                            setFromCode(e.target.value)
                          }
                          className="w-full appearance-none pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-gray-50"
                        >
                          {airports.map(a => (
                            <option
                              key={a.code}
                              value={a.code}
                            >
                              {a.city} ({a.code}) - {a.country}
                            </option>
                          ))}
                        </select>

                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                      </div>
                    </div>

                    {/* Swap */}
                    <div className="hidden lg:flex items-center justify-center -mb-4">

                      <button
                        onClick={swapCities}
                        className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors group"
                        title="Đổi chiều"
                      >
                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:rotate-180 transition-transform duration-300" />
                      </button>

                    </div>

                    {/* To */}
                    <div className="relative">

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        <MapPin className="w-3.5 h-3.5" />
                        Nơi đến
                      </label>

                      <div className="relative">

                        <select
                          value={toCode}
                          onChange={e =>
                            setToCode(e.target.value)
                          }
                          className="w-full appearance-none pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-gray-50"
                        >
                          {airports.map(a => (
                            <option
                              key={a.code}
                              value={a.code}
                            >
                              {a.city} ({a.code}) - {a.country}
                            </option>
                          ))}
                        </select>

                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                      </div>
                    </div>

                    {/* Departure */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        <Calendar className="w-3.5 h-3.5" />
                        Ngày đi
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="date"
                          value={departureDate}
                          onChange={e =>
                            setDepartureDate(e.target.value)
                          }
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Return + Passengers + Class */}
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 ${
                      tripType === 'round-trip'
                        ? ''
                        : 'sm:grid-cols-2'
                    }`}
                  >

                    {tripType === 'round-trip' && (
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                          <Calendar className="w-3.5 h-3.5" />
                          Ngày về
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input
                            type="date"
                            value={returnDate}
                            onChange={e =>
                              setReturnDate(
                                e.target.value
                              )
                            }
                            className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          />
                        </div>
                      </div>
                    )}

                    {/* Passengers */}
                    <div className="relative">

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        <Users className="w-3.5 h-3.5" />
                        Hành khách
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={passengers}
                        onChange={e => {
                          const value = Number(
                            e.target.value
                          );

                          if (value >= 1) {
                            setPassengers(value);
                          }
                        }}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="Nhập số người"
                      />

                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                    </div>

                    {/* Class */}
                    <div className="relative">

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        <Tag className="w-3.5 h-3.5" />
                        Hạng vé
                      </label>

                      <select
                        value={cabinClass}
                        onChange={e =>
                          setCabinClass(
                            e.target.value as SeatClass
                          )
                        }
                        className="w-full appearance-none pl-10 pr-8 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-gray-50"
                      >
                        {cabinClasses.map(c => (
                          <option
                            key={c.id}
                            value={c.id}
                          >
                            {c.name}
                          </option>
                        ))}
                      </select>

                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                    </div>

                  </div>
                </>
              )}

              {/* Passengers + Class for Multi City */}
              {tripType === 'multi-city' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                  <div className="relative">

                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      <Users className="w-3.5 h-3.5" />
                      Hành khách
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={passengers}
                      onChange={e => {
                        const value = Number(
                          e.target.value
                        );

                        if (value >= 1) {
                          setPassengers(value);
                        }
                      }}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      placeholder="Nhập số người"
                    />

                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  </div>

                  <div className="relative">

                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      <Tag className="w-3.5 h-3.5" />
                      Hạng vé
                    </label>

                    <select
                      value={cabinClass}
                      onChange={e =>
                        setCabinClass(
                          e.target.value as SeatClass
                        )
                      }
                      className="w-full appearance-none pl-10 pr-8 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-gray-50"
                    >
                      {cabinClasses.map(c => (
                        <option
                          key={c.id}
                          value={c.id}
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  </div>

                </div>
              )}

              {searchError && (
                <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2.5 animate-fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-full mt-5 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 group"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Tìm chuyến bay
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="text-center mb-10">

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Tuyến đường phổ biến
          </h2>

          <p className="text-gray-500">
            Giá tốt nhất cho các chặng bay được yêu thích
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {popularRoutes.map(
            (route, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setFromCode(route.from);
                  setToCode(route.to);

                  setSearch({
                    ...search,
                    fromCode: route.from,
                    toCode: route.to,
                  });

                  loadFlights(
                    route.from,
                    route.to
                  );

                  navigate('list');
                }}
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all text-left"
              >

                <div className="flex items-center justify-between mb-3">

                  <span className="text-sm font-semibold text-gray-900">
                    {route.label}
                  </span>

                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />

                </div>

                <p className="text-xs text-gray-400 mb-3">
                  Khởi hành từ
                </p>

                <p className="text-xl font-bold text-blue-600">
                  {formatPrice(route.price)}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Giá một chiều / hành khách
                </p>

              </button>
            )
          )}

        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10">

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Tại sao chọn SkyTicket?
            </h2>

            <p className="text-gray-500">
              Trải nghiệm đặt vé vượt trội
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {[
              {
                icon: Tag,
                title: 'Giá tốt nhất',
                desc: 'Cam kết giá tốt thị trường. Hoàn tiền nếu bạn tìm thấy giá rẻ hơn.',
                color:
                  'from-emerald-400 to-green-600',
                bg: 'bg-emerald-50',
              },
              {
                icon: Clock,
                title: 'Đặt vé nhanh chóng',
                desc: 'Chỉ vài cú click để hoàn tất đặt vé. Xác nhận tức thời qua email.',
                color:
                  'from-sky-400 to-blue-600',
                bg: 'bg-sky-50',
              },
              {
                icon: Shield,
                title: 'Thanh toán an toàn',
                desc: 'Bảo mật thông tin 100%. Đa dạng phương thức thanh toán.',
                color:
                  'from-amber-400 to-orange-600',
                bg: 'bg-amber-50',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >

                <div
                  className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-4`}
                >

                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center`}
                  >
                    <f.icon className="w-5 h-5 text-white" />
                  </div>

                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Airlines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="text-center mb-10">

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Hãng hàng không đối tác
          </h2>

          <p className="text-gray-500">
            Hơn 8 hãng hàng không nội địa và quốc tế
          </p>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          {airlines.map(airline => (
            <div
              key={airline.id}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
            >

              <AirlineLogo
                airline={airline}
                size="lg"
              />

              <div className="text-center">

                <p className="font-semibold text-gray-900 text-sm">
                  {airline.name}
                </p>

                <div className="flex items-center justify-center gap-1 mt-1">

                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />

                  <span className="text-xs text-gray-500">
                    {airline.rating}
                  </span>

                </div>

              </div>

            </div>
          ))}

        </div>
      </section>

    </div>
  );
}
