
// Simple weather service using OpenWeatherMap API
// Alternative APIs can be used if preferred

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'YOUR_OPENWEATHERMAP_API_KEY_HERE';

// Default location if geolocation fails
const DEFAULT_LOCATION = { lat: 40.7128, lon: -74.0060 }; // New York City

// API response interfaces
interface OpenWeatherMapResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  rain?: {
    '1h': number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  name: string;
  timezone: number;
}

interface OpenWeatherMapForecastItem {
  dt: number;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
  rain?: {
    '3h': number;
  };
}

interface OpenWeatherMapForecastResponse {
  list: OpenWeatherMapForecastItem[];
}

export interface WeatherData {
  temperature: number;
  precipitation: number;
  description: string;
  iconUrl: string;
  location: string;
  region: string;
  country: string;
  timezone: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface WeatherRecommendations {
  outfitType: string;
  layers: string[];
  accessories: string[];
  footwear: string;
  confidence: number;
  reasoning: string;
}

// Get user's current location
const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_LOCATION);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      error => {
        // Silently fallback to default location
        resolve(DEFAULT_LOCATION);
      }
    );
  });
};

export const getCurrentWeather = async (): Promise<WeatherData> => {
  try {
    const location = await getUserLocation();
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    
    const data: OpenWeatherMapResponse = await response.json();
    
    // Get forecast data for hourly and daily forecasts
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!forecastResponse.ok) {
      throw new Error('Forecast data fetch failed');
    }
    
    const forecastData: OpenWeatherMapForecastResponse = await forecastResponse.json();
    
    // Process hourly forecast (next 24 hours)
    const hourlyForecast: HourlyForecast[] = forecastData.list
      .slice(0, 8) // Next 24 hours (3-hour intervals, 8 data points)
      .map((item: OpenWeatherMapForecastItem) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].description,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
        precipitation: item.rain ? item.rain['3h'] / 10 : 0
      }));
    
    // Process daily forecast (next 7 days)
    const dailyForecast: DailyForecast[] = [];
    const dailyData: { [key: string]: OpenWeatherMapForecastItem[] } = {};
    
    forecastData.list.forEach((item: OpenWeatherMapForecastItem) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });
    
    Object.keys(dailyData).slice(0, 7).forEach(date => {
      const dayData = dailyData[date];
      const temps = dayData.map((item: OpenWeatherMapForecastItem) => item.main.temp);
      const high = Math.round(Math.max(...temps));
      const low = Math.round(Math.min(...temps));
      
      dailyForecast.push({
        date,
        high,
        low,
        condition: dayData[0].weather[0].description,
        humidity: Math.round(dayData.reduce((sum: number, item: OpenWeatherMapForecastItem) => sum + item.main.humidity, 0) / dayData.length),
        windSpeed: Math.round(dayData.reduce((sum: number, item: OpenWeatherMapForecastItem) => sum + item.wind.speed, 0) / dayData.length * 3.6),
        precipitation: dayData.reduce((sum: number, item: OpenWeatherMapForecastItem) => sum + (item.rain ? item.rain['3h'] / 10 : 0), 0) / dayData.length
      });
    });
    
    return {
      temperature: Math.round(data.main.temp),
      precipitation: data.rain ? data.rain['1h'] / 10 : 0,
      description: data.weather[0].description,
      iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      location: data.name,
      region: data.sys.country,
      country: data.sys.country,
      timezone: data.timezone.toString(),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      uvIndex: 0, // Would need UV index from different endpoint
      visibility: Math.round(data.visibility / 1000), // Convert meters to km
      pressure: data.main.pressure,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hourlyForecast,
      dailyForecast
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Fallback to mock data if API call fails
    return getMockWeather();
  }
};

// Mock weather data for development (when API is not connected)
const getMockWeather = (): WeatherData => {
  const currentDate = new Date();
  const hour = currentDate.getHours();
  const season = getSeason();
  
  // Generate weather based on season
  let tempRange, precipRange, descriptions, icons;
  
  switch (season) {
    case 'Summer':
      tempRange = { min: 22, max: 35 };
      precipRange = { min: 0, max: 0.3 };
      descriptions = ['Clear sky', 'Sunny', 'Partly cloudy'];
      icons = ['01d', '02d', '03d'];
      break;
    case 'Winter':
      tempRange = { min: -5, max: 10 };
      precipRange = { min: 0, max: 0.5 };
      descriptions = ['Snow', 'Cold', 'Cloudy'];
      icons = ['13d', '50d', '04d'];
      break;
    case 'Fall':
      tempRange = { min: 8, max: 18 };
      precipRange = { min: 0, max: 0.7 };
      descriptions = ['Cloudy', 'Light rain', 'Windy'];
      icons = ['03d', '09d', '50d'];
      break;
    default: // Spring
      tempRange = { min: 15, max: 25 };
      precipRange = { min: 0, max: 0.4 };
      descriptions = ['Light rain', 'Partly cloudy', 'Mild'];
      icons = ['09d', '02d', '03d'];
  }
  
  // Generate random values within season ranges
  const temperature = Math.round(Math.random() * (tempRange.max - tempRange.min) + tempRange.min);
  const precipitation = Math.random() * (precipRange.max - precipRange.min) + precipRange.min;
  
  // Pick a random description and icon
  const randomIndex = Math.floor(Math.random() * descriptions.length);
  
  const feelsLike = temperature + Math.round((Math.random() - 0.5) * 5);
  const humidity = Math.round(Math.random() * 40 + 40); // 40-80%
  const windSpeed = Math.round(Math.random() * 20 + 5); // 5-25 km/h
  const uvIndex = Math.round(Math.random() * 10 + 1); // 1-11
  const visibility = Math.round(Math.random() * 5 + 5); // 5-10 km
  const pressure = Math.round(Math.random() * 50 + 1000); // 1000-1050 hPa

  // Generate hourly forecast (next 24 hours)
  const hourlyForecast: HourlyForecast[] = [];
  for (let i = 0; i < 24; i++) {
    const hourTemp = temperature + Math.round((Math.random() - 0.5) * 8);
    hourlyForecast.push({
      time: `${(hour + i) % 24}:00`,
      temperature: hourTemp,
      condition: descriptions[Math.floor(Math.random() * descriptions.length)],
      humidity: Math.round(Math.random() * 40 + 40),
      windSpeed: Math.round(Math.random() * 20 + 5),
      precipitation: Math.random() * 0.5
    });
  }

  // Generate daily forecast (next 7 days)
  const dailyForecast: DailyForecast[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayHigh = temperature + Math.round(Math.random() * 8 + 2);
    const dayLow = temperature - Math.round(Math.random() * 8 + 2);
    
    dailyForecast.push({
      date: date.toISOString().split('T')[0],
      high: dayHigh,
      low: dayLow,
      condition: descriptions[Math.floor(Math.random() * descriptions.length)],
      humidity: Math.round(Math.random() * 40 + 40),
      windSpeed: Math.round(Math.random() * 20 + 5),
      precipitation: Math.random() * 0.5
    });
  }

  return {
    temperature,
    precipitation,
    description: descriptions[randomIndex],
    iconUrl: `https://openweathermap.org/img/wn/${icons[randomIndex]}@2x.png`,
    location: 'Your Location',
    region: 'Your Region',
    country: 'Your Country',
    timezone: 'UTC',
    feelsLike,
    humidity,
    windSpeed,
    uvIndex,
    visibility,
    pressure,
    sunrise: '06:30',
    sunset: '19:45',
    hourlyForecast,
    dailyForecast
  };
};

// Get current season
const getSeason = (): 'Spring' | 'Summer' | 'Fall' | 'Winter' => {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
};

// Generate outfit recommendations based on weather
export const getWeatherBasedRecommendations = (weather: WeatherData): WeatherRecommendations => {
  const { temperature, precipitation, windSpeed, humidity } = weather;
  
  let outfitType = '';
  let layers: string[] = [];
  let accessories: string[] = [];
  let footwear = '';
  let reasoning = '';

  // Determine outfit type based on temperature
  if (temperature < 5) {
    outfitType = 'Heavy Winter';
    layers = ['Thermal base layer', 'Warm sweater', 'Heavy coat'];
    accessories = ['Scarf', 'Gloves', 'Winter hat'];
    footwear = 'Insulated boots';
    reasoning = 'Very cold weather requires multiple warm layers';
  } else if (temperature < 15) {
    outfitType = 'Light Winter';
    layers = ['Long sleeve shirt', 'Light sweater', 'Jacket'];
    accessories = ['Light scarf', 'Gloves'];
    footwear = 'Closed-toe shoes';
    reasoning = 'Cool weather needs light layering';
  } else if (temperature < 25) {
    outfitType = 'Spring/Fall';
    layers = ['T-shirt or blouse', 'Light jacket or cardigan'];
    accessories = ['Light scarf (optional)'];
    footwear = 'Comfortable shoes';
    reasoning = 'Mild weather allows for light, comfortable clothing';
  } else {
    outfitType = 'Summer';
    layers = ['Light t-shirt or tank top'];
    accessories = ['Sunglasses', 'Hat'];
    footwear = 'Sandals or light shoes';
    reasoning = 'Warm weather calls for light, breathable clothing';
  }

  // Adjust for precipitation
  if (precipitation > 0.3) {
    accessories.push('Umbrella');
    footwear = 'Waterproof shoes';
    reasoning += ' with rain protection';
  }

  // Adjust for wind
  if (windSpeed > 15) {
    accessories.push('Windbreaker');
    reasoning += ' and wind protection';
  }

  // Calculate confidence based on weather consistency
  const confidence = Math.min(95, 70 + (temperature > 15 && temperature < 25 ? 20 : 0));

  return {
    outfitType,
    layers,
    accessories,
    footwear,
    confidence,
    reasoning
  };
};

export const getWeatherByLocation = async (locationName: string): Promise<WeatherData> => {
  try {
    console.log('Fetching weather for:', locationName);
    console.log('API Key available:', API_KEY !== 'YOUR_OPENWEATHERMAP_API_KEY_HERE');
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationName)}&units=metric&appid=${API_KEY}`
    );
    
    console.log('Weather API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API error:', errorText);
      throw new Error(`Weather data fetch failed: ${response.status}`);
    }
    
    const data: OpenWeatherMapResponse = await response.json();
    console.log('Weather data received:', data);
    
    // Get forecast data for hourly and daily forecasts
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(locationName)}&units=metric&appid=${API_KEY}`
    );
    
    let hourlyForecast: HourlyForecast[] = [];
    let dailyForecast: DailyForecast[] = [];
    
    if (forecastResponse.ok) {
      const forecastData: OpenWeatherMapForecastResponse = await forecastResponse.json();
      
      // Process hourly forecast (next 24 hours)
      hourlyForecast = forecastData.list
        .slice(0, 8)
        .map((item: OpenWeatherMapForecastItem) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: Math.round(item.main.temp),
          condition: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6),
          precipitation: item.rain ? item.rain['3h'] / 10 : 0
        }));
      
      // Process daily forecast
      const dailyData: { [key: string]: OpenWeatherMapForecastItem[] } = {};
      
      forecastData.list.forEach((item: OpenWeatherMapForecastItem) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = [];
        }
        dailyData[date].push(item);
      });
      
      dailyForecast = Object.keys(dailyData).slice(0, 7).map(date => {
        const dayData = dailyData[date];
        const temps = dayData.map((item: OpenWeatherMapForecastItem) => item.main.temp);
        const high = Math.round(Math.max(...temps));
        const low = Math.round(Math.min(...temps));
        
        return {
          date,
          high,
          low,
          condition: dayData[0].weather[0].description,
          humidity: Math.round(dayData.reduce((sum: number, item: OpenWeatherMapForecastItem) => sum + item.main.humidity, 0) / dayData.length),
          windSpeed: Math.round(dayData.reduce((sum: number, item: OpenWeatherMapForecastItem) => sum + item.wind.speed, 0) / dayData.length * 3.6),
          precipitation: dayData.reduce((sum: number, item: OpenWeatherMapForecastItem) => sum + (item.rain ? item.rain['3h'] / 10 : 0), 0) / dayData.length
        };
      });
    }
    
    return {
      temperature: Math.round(data.main.temp),
      precipitation: data.rain ? data.rain['1h'] / 10 : 0,
      description: data.weather[0].description,
      iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      location: data.name,
      region: data.sys.country,
      country: data.sys.country,
      timezone: data.timezone.toString(),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      uvIndex: 0,
      visibility: Math.round(data.visibility / 1000),
      pressure: data.main.pressure,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hourlyForecast,
      dailyForecast
    };
  } catch (error) {
    console.error('Error fetching weather by location:', error);
    // Fallback to location-specific mock data
    const mockWeather = getLocationSpecificMockWeather(locationName);
    return mockWeather;
  }
};

// Location-specific mock weather data
const getLocationSpecificMockWeather = (locationName: string): WeatherData => {
  const location = locationName.toLowerCase();
  
  let tempRange, description, icon;
  
  if (location.includes('chennai')) {
    tempRange = { min: 23, max: 29 };
    description = 'Partly cloudy';
    icon = '02d';
  } else if (location.includes('bengaluru') || location.includes('bangalore')) {
    tempRange = { min: 17, max: 25 };
    description = 'Pleasant';
    icon = '01d';
  } else {
    // Default fallback
    tempRange = { min: 20, max: 28 };
    description = 'Clear sky';
    icon = '01d';
  }
  
  const temperature = Math.round(Math.random() * (tempRange.max - tempRange.min) + tempRange.min);
  
  return {
    temperature,
    precipitation: 0,
    description,
    iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
    location: locationName,
    region: 'IN',
    country: 'India',
    timezone: 'Asia/Kolkata',
    feelsLike: temperature + 2,
    humidity: 65,
    windSpeed: 12,
    uvIndex: 6,
    visibility: 10,
    pressure: 1013,
    sunrise: '06:15',
    sunset: '18:30',
    hourlyForecast: [],
    dailyForecast: []
  };
};
