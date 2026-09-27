export interface GeocodingResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

/** Parse a complete "latitude, longitude" or "latitude longitude" query. */
export function parseCoordinates(query: string): { latitude: number; longitude: number } | null {
  const match = query.trim().match(/^\(?\s*(-?\d+(?:\.\d+)?)\s*(?:,|\s)\s*(-?\d+(?:\.\d+)?)\s*\)?$/);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

function formatFeature(feature: PhotonFeature, index: number): GeocodingResult | null {
  const coordinates = feature.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) return null;
  const [longitude, latitude] = coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const properties = feature.properties ?? {};
  const street = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  const primary = properties.name || street || properties.city || properties.district || properties.county || properties.state || properties.country;
  if (!primary) return null;

  const context = [properties.city, properties.district, properties.state, properties.country]
    .filter((value, position, values): value is string => Boolean(value) && values.indexOf(value) === position && value !== primary);
  const name = [primary, ...context].join(", ");

  return { id: `${latitude}:${longitude}:${index}`, name, latitude, longitude };
}

/** Search OpenStreetMap-backed Photon autocomplete results (no API key required). */
export async function searchPlaces(query: string, signal: AbortSignal): Promise<GeocodingResult[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "6");

  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Location search is temporarily unavailable.");

  const data = await response.json() as PhotonResponse;
  return (data.features ?? [])
    .map(formatFeature)
    .filter((result): result is GeocodingResult => result !== null);
}
