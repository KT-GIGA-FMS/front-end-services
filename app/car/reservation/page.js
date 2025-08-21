// app/car/reservation/page.js
"use client";

import { useState } from "react";
import NavBar from "../../../components/NavBar";

// 예약 상태별 색상 정의
const statusColors = {
  '사용중': { bg: '#e6f3ff', text: '#0066cc', border: '#b3d9ff' },
  '사용대대기': { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
  '사용완료': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
};

// 시간 슬롯 생성 (09:00 - 22:00)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

// 더미 데이터
const vehicleData = [
  {
    id: 1,
    name: "G90",
    plateNumber: "59너5959",
    image: "/api/placeholder/40/30",
    status: "사용중",
    reservations: [
      {
        id: 1,
        startTime: "10:05",
        endTime: "17:05",
        duration: "7시간 0분",
        date: "25.08.20",
        status: "사용중"
      }
    ]
  },
  {
    id: 2,
    name: "아반떼",
    plateNumber: "15라1234",
    image: "/api/placeholder/40/30",
    status: "사용중",
    reservations: []
  },
  {
    id: 3,
    name: "G시리즈(G70)",
    plateNumber: "321더4740",
    image: "/api/placeholder/40/30",
    status: "사용중",
    reservations: []
  },
  {
    id: 4,
    name: "볼보K3",
    plateNumber: "333하8898",
    image: "/api/placeholder/40/30",
    status: "사용중",
    reservations: []
  },
  {
    id: 5,
    name: "더 뉴 K9 (RJ)",
    plateNumber: "90라1111",
    image: "/api/placeholder/40/30",
    status: "사용중",
    reservations: []
  }
];

const reservationTabs = [
  { label: "전체 (7)", value: "all", count: 7 },
  { label: "사용대기 (1)", value: "scheduled", count: 1 },
  { label: "사용중 (2)", value: "inuse", count: 2 },
  { label: "사용완료 (4)", value: "completed", count: 4 }
];

export default function ReservationPage() {
  const [selectedDate, setSelectedDate] = useState("2025.08.20");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const timeSlots = generateTimeSlots();
  const currentTime = 15; // 현재 시간 (15:00)

  const tabs = [
    { label: "차량 목록", href: "/car" },
    { label: "차량 관리", href: "/car/management" },
    { label: "차량 예약", href: "/car/reservation" }
  ];

  return (
    <div className=" w-full bg-gray-50">
      <NavBar tabs={tabs} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <input
                type="date"
                value="2025-08-20"
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="차량 및 사용자 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">터미날인 보기 (일)</span>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                예약 등록
              </button>
            </div>
          </div>

          {/* 예약 상태 탭 */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg inline-flex">
            {reservationTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 예약 캘린더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 날짜 헤더 */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{selectedDate}</h3>
          </div>

          {/* 시간대 헤더 */}
          <div className="flex border-b border-gray-200">
            <div className="w-48 p-4 bg-gray-50"></div>
            <div className="flex-1 flex">
              {timeSlots.map((time, index) => (
                <div key={time} className="flex-1 p-2 text-center text-xs text-gray-600 border-l border-gray-100">
                  {time}
                </div>
              ))}
            </div>
          </div>

          {/* 차량별 예약 현황 */}
          <div className="divide-y divide-gray-100">
            {vehicleData.map((vehicle) => (
              <div key={vehicle.id} className="flex">
                {/* 차량 정보 */}
                <div className="w-48 p-4 flex items-center gap-3 bg-gray-50">
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name}
                    className="w-10 h-8 object-cover rounded border"
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{vehicle.name}</div>
                    <div className="text-xs text-gray-500">{vehicle.plateNumber}</div>
                  </div>
                  <span className={`ml-auto px-2 py-1 text-xs rounded-full border ${
                    vehicle.status === '사용중' 
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>

                {/* 시간대별 예약 현황 */}
                <div className="flex-1 relative h-16">
                  {/* 현재 시간 표시선 */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${((currentTime - 9) / 13) * 100}%` }}
                  >
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>

                  {/* 시간대 구분선 */}
                  {timeSlots.map((_, index) => (
                    <div 
                      key={index}
                      className="absolute top-0 bottom-0 border-l border-gray-100"
                      style={{ left: `${(index / 13) * 100}%` }}
                    />
                  ))}

                  {/* 예약 블록 */}
                  {vehicle.reservations.map((reservation) => {
                    const startHour = parseInt(reservation.startTime.split(':')[0]);
                    const startMinute = parseInt(reservation.startTime.split(':')[1]);
                    const endHour = parseInt(reservation.endTime.split(':')[0]);
                    const endMinute = parseInt(reservation.endTime.split(':')[1]);
                    
                    const startPercent = ((startHour - 9 + startMinute / 60) / 13) * 100;
                    const endPercent = ((endHour - 9 + endMinute / 60) / 13) * 100;
                    const width = endPercent - startPercent;

                    const colors = statusColors[reservation.status] || statusColors['사용중'];

                    return (
                      <div
                        key={reservation.id}
                        className="absolute top-2 bottom-2 rounded px-2 flex items-center text-xs font-medium border"
                        style={{
                          left: `${startPercent}%`,
                          width: `${width}%`,
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderColor: colors.border
                        }}
                      >
                        <div className="truncate">
                          <div className="font-medium">감자침 {reservation.startTime} - {reservation.endTime} ({reservation.duration})</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .reservation-block {
          position: relative;
          overflow: hidden;
        }
        
        .reservation-block::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
