import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Droplets, Wind, Thermometer, Sunrise, Sunset, Eye, Cloud } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getWeatherIcon } from '@/lib/utils';
import { POPULAR_DESTINATIONS, WEATHER_API_KEY, WEATHER_API_URL } from '@/config/constants';
import type { WeatherInfo } from '@/types';
import { toast } from '@/components/ui/Toast';

export function WeatherPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeather = async (location: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${WEATHER_API_URL}/${encodeURIComponent(location)}?unitGroup=metric&key=${WEATHER_API_KEY}&contentType=json`
      );
      
      if (!response.ok) throw new Error('Location not found');
      
      const data = await response.json();
      setWeather(data);
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
          fetchWeather(`${position.coords.latitude},${position.coords.longitude}`);
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
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">Weather</h1>
        <p className="text-slate-400 mt-1">Check weather conditions anywhere</p>
      </div>

      {/* Search */}
      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search city or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50"
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
          <p className="text-sm text-slate-400 mb-3">Popular destinations:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_DESTINATIONS.slice(0, 8).map((dest) => (
              <button
                key={dest.name}
                onClick={() => {
                  setSearchQuery(`${dest.name}, ${dest.country}`);
                  fetchWeather(`${dest.name}, ${dest.country}`);
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 hover:text-white transition-colors"
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
          <Card variant="gradient" className="overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-teal-500/20" />
            <CardContent className="relative z-10 py-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Main Info */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary-400" />
                    <span className="text-lg text-white font-medium">{weather.resolvedAddress}</span>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <span className="text-8xl">
                      {getWeatherIcon(currentConditions.icon)}
                    </span>
                    <div>
                      <p className="text-6xl font-display font-bold text-white">
                        {Math.round(currentConditions.temp)}°
                      </p>
                      <p className="text-xl text-slate-300">{currentConditions.conditions}</p>
                    </div>
                  </div>

                  <p className="text-slate-400">{weather.description}</p>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Thermometer className="w-4 h-4" />
                      <span className="text-sm">Feels Like</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{Math.round(currentConditions.feelslike)}°C</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Droplets className="w-4 h-4" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{currentConditions.humidity}%</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Wind className="w-4 h-4" />
                      <span className="text-sm">Wind Speed</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{currentConditions.windspeed} km/h</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Conditions</span>
                    </div>
                    <p className="text-lg font-bold text-white truncate">{currentConditions.conditions}</p>
                  </div>
                </div>
              </div>

              {/* Sunrise & Sunset */}
              <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Sunrise className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Sunrise</p>
                    <p className="text-white font-medium">{currentConditions.sunrise}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Sunset className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Sunset</p>
                    <p className="text-white font-medium">{currentConditions.sunset}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card className="p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4">7-Day Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.days.slice(0, 7).map((day, i) => (
                <motion.div
                  key={day.datetime}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'p-4 rounded-xl text-center',
                    i === 0 ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-white/5'
                  )}
                >
                  <p className="text-sm text-slate-400 mb-2">
                    {i === 0 ? 'Today' : new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <span className="text-3xl block mb-2">{getWeatherIcon(day.icon)}</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-white font-medium">{Math.round(day.tempmax)}°</span>
                    <span className="text-slate-500">{Math.round(day.tempmin)}°</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{day.conditions}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!weather && !isLoading && (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <Cloud className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Check the Weather</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Search for a city or use your current location to see weather conditions
          </p>
        </Card>
      )}
    </motion.div>
  );
}

export default WeatherPage;
