import { fetchMockTrack } from "./carTrackingMock";
import { fetchApiTrack } from "./carTrackingApi";

const SOURCE = process.env.NEXT_PUBLIC_TRACKING_SOURCE || "mock";

export async function getTrack(vehicleId) {
  if (SOURCE === "api") return fetchApiTrack(vehicleId);
  // ws 등 확장 가능
  return fetchMockTrack(vehicleId);
}
