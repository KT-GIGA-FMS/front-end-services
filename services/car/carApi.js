// services/carApi.js
const API_BASE_URL = process.env.NEXT_PUBLIC_CAR_BASE_URL || ""


export const carApi = {
  // 차량 목록 조회
  getCars: async () => {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) throw new Error('차량 조회 실패');
    return response.json();
  },

  // 차량 등록
  createCar: async (carData) => {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Ocp-Apim-Subscription-Key": "5b3a9cac916f4df0983220718d127863"
      },
      body: JSON.stringify(carData),
    });
    if (!response.ok) throw new Error('차량 등록 실패');
    return response.json();
  },

  // 이미지 업로드
//   uploadCarImage: async (file) => {
//     const formData = new FormData();
//     formData.append('image', file);
    
//     const response = await fetch(`${API_BASE_URL}/api/cars/upload`, {
//       method: 'POST',
//       body: formData,
//     });
//     if (!response.ok) throw new Error('이미지 업로드 실패');
//     return response.json();
//   }
};