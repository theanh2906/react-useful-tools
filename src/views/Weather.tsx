/**
 * @module WeatherPage
 * @description Weather forecast page with city search, geolocation support
 * and popular destination shortcuts.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  Sunrise,
  Sunset,
  Eye,
  Cloud,
} from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getWeatherIcon } from '@/lib/utils';
import {
  POPULAR_DESTINATIONS,
  WEATHER_API_KEY,
  WEATHER_API_URL,
} from '@/config/constants';
import type { WeatherInfo } from '@/types';
import { toast } from '@/components/ui/Toast';

/**
 * Reverse-geocodes latitude/longitude to a human-readable address using Nominatim.
 *
 * @param lat - Latitude.
 * @param lon - Longitude.
 * @returns Display name string or `null` on failure.
 */
const reverseGeocode = async (
  lat: number,
  lon: number
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.display_name || null;
  } catch {
    return null;
  }
};

/**
 * Checks whether the input string looks like a "lat,lon" coordinate pair.
 *
 * @param address - Input string to test.
 * @returns `true` if the string can be parsed as two comma-separated numbers.
 */
const isCoordinateString = (address: string): boolean => {
  const parts = address.split(',').map((s) => s.trim());
  return parts.length === 2 && parts.every((p) => !isNaN(Number(p)));
};

/**
 * Weather page.
 * Searches for weather by city name, coordinates or browser geolocation.
 * Displays current conditions, temperature, wind, humidity and visibility.
 */
export function WeatherPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);

  const fetchWeather = async (location: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${WEATHER_API_URL}/${encodeURIComponent(location)}?unitGroup=metric&key=${WEATHER_API_KEY}&contentType=json`
      );

      if (!response.ok) throw new Error('Location not found');

      const data = await response.json();
      setWeather(data);

      // Reverse geocode if resolvedAddress looks like coordinates
      if (isCoordinateString(data.resolvedAddress)) {
        const [lat, lon] = data.resolvedAddress.split(',').map(Number);
        const address = await reverseGeocode(lat, lon);
        setDisplayAddress(address);
      } else {
        setDisplayAddress(null);
      }
    } catch {
      toast.error('Could not find weather for this location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery);
    }
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(
            `${position.coords.latitude},${position.coords.longitude}`
          );
        },
        () => {
          toast.error('Could not get your location');
          setIsLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported');
    }
  };

  const currentConditions = weather?.currentConditions;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
          Weather
        </h1>
        <p className="mt-1 text-muted">Check weather conditions anywhere</p>
      </div>

      {/* Search */}
      <Card className="p-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search city or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-line bg-elevated py-3 pl-12 pr-4 text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100"
            />
          </div>
          <Button type="submit" isLoading={isLoading}>
            Search
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
          >
            <MapPin className="w-4 h-4" />
            My Location
          </Button>
        </form>

        {/* Popular destinations */}
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">Popular destinations:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_DESTINATIONS.slice(0, 8).map((dest) => (
              <button
                key={dest.name}
                onClick={() => {
                  setSearchQuery(`${dest.name}, ${dest.country}`);
                  fetchWeather(`${dest.name}, ${dest.country}`);
                }}
                className="rounded-md border border-line bg-elevated px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700"
              >
                {dest.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Weather Display */}
      {weather && currentConditions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current Weather */}
          <Card className="overflow-hidden border-accent-200">
            <CardContent className="py-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Main Info */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-accent-500" />
                    <span className="text-lg font-medium text-foreground">
                      {displayAddress || weather.resolvedAddress}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 mb-6">
                    <span className="text-8xl">
                      {getWeatherIcon(currentConditions.icon)}
                    </span>
                    <div>
                      <p className="font-display text-6xl font-bold text-foreground">
                        {Math.round(currentConditions.temp)}°
                      </p>
                      <p className="text-xl text-muted">
                        {currentConditions.conditions}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted">{weather.description}</p>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-b border-r border-line p-4">
                    <div className="mb-2 flex items-center gap-2 text-muted">
                      <Thermometer className="w-4 h-4" />
                      <span className="text-sm">Feels Like</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(currentConditions.feelslike)}°C
                    </p>
                  </div>

                  <div className="border-b border-line p-4">
                    <div className="mb-2 flex items-center gap-2 text-muted">
                      <Droplets className="w-4 h-4" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {currentConditions.humidity}%
                    </p>
                  </div>

                  <div className="border-r border-line p-4">
                    <div className="mb-2 flex items-center gap-2 text-muted">
                      <Wind className="w-4 h-4" />
                      <span className="text-sm">Wind Speed</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {currentConditions.windspeed} km/h
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-muted">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Conditions</span>
                    </div>
                    <p className="truncate text-lg font-bold text-foreground">
                      {currentConditions.conditions}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sunrise & Sunset */}
              <div className="mt-8 flex items-center justify-center gap-8 border-t border-line pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                    <Sunrise className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Sunrise</p>
                    <p className="font-medium text-foreground">
                      {currentConditions.sunrise}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                    <Sunset className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Sunset</p>
                    <p className="font-medium text-foreground">
                      {currentConditions.sunset}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card className="p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              7-Day Forecast
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.days.slice(0, 7).map((day, i) => (
                <motion.div
                  key={day.datetime}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'rounded-lg p-4 text-center',
                    i === 0
                      ? 'border border-accent-200 bg-accent-50'
                      : 'border border-line bg-surface'
                  )}
                >
                  <p className="mb-2 text-sm text-muted">
                    {i === 0
                      ? 'Today'
                      : new Date(day.datetime).toLocaleDateString('en-US', {
                          weekday: 'short',
                        })}
                  </p>
                  <span className="text-3xl block mb-2">
                    {getWeatherIcon(day.icon)}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium text-foreground">
                      {Math.round(day.tempmax)}°
                    </span>
                    <span className="text-muted">
                      {Math.round(day.tempmin)}°
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted">
                    {day.conditions}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!weather && !isLoading && (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-lg bg-accent-50">
            <Cloud className="h-10 w-10 text-accent-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Check the Weather
          </h3>
          <p className="mx-auto max-w-md text-muted">
            Search for a city or use your current location to see weather
            conditions
          </p>
        </Card>
      )}
    </motion.div>
  );
}

export default WeatherPage;
