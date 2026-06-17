export type LocationWeather = {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  uvIndex: number;
  tempUnit: string;
};

async function weatherAt(latitude: number, longitude: number, city: string): Promise<LocationWeather> {
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,uv_index&timezone=auto`
  );
  if (!weatherRes.ok) throw new Error("Weather fetch failed");
  const weather = await weatherRes.json();
  const current = weather.current as {
    temperature_2m: number;
    relative_humidity_2m: number;
    uv_index: number;
  };
  return {
    city,
    latitude,
    longitude,
    temperature: Math.round(current.temperature_2m),
    humidity: Math.round(current.relative_humidity_2m),
    uvIndex: Math.round(current.uv_index * 10) / 10,
    tempUnit: weather.current_units?.temperature_2m ?? "°C",
  };
}

async function cityFromCoords(latitude: number, longitude: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) return "";
  const data = await res.json() as {
    address?: { city?: string; town?: string; village?: string; county?: string; state?: string };
  };
  return (
    data.address?.city ??
    data.address?.town ??
    data.address?.village ??
    data.address?.county ??
    data.address?.state ??
    ""
  );
}

export function detectCityAndWeather(): Promise<LocationWeather | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const city = await cityFromCoords(latitude, longitude);
          const data = await weatherAt(latitude, longitude, city);
          resolve(data);
        } catch {
          resolve(null);
        }
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  });
}

export async function fetchWeatherForCity(city: string): Promise<LocationWeather | null> {
  const trimmed = city.trim();
  if (!trimmed) return null;

  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1&language=en`
  );
  if (!geoRes.ok) return null;
  const geo = await geoRes.json();
  const hit = geo.results?.[0];
  if (!hit) return null;

  try {
    return await weatherAt(hit.latitude, hit.longitude, hit.name ?? trimmed);
  } catch {
    return null;
  }
}
