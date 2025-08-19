export async function fetchMockTrack(vehicleId) {
    const res = await fetch("/data/car-tracking/tracks.sample.json"); // Next public 폴더 경로도 가능
    if (!res.ok) throw new Error("mock track load failed");
    const json = await res.json();
    return json;
  }
  