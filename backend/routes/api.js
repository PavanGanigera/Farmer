import express from 'express';
import axios from 'axios';
const router = express.Router();

// A simple map of common districts to coordinates for the free Open-Meteo API
const DISTRICT_COORDS = {
  'Warangal': { lat: 17.9693, lon: 79.5926 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Guntur': { lat: 16.3067, lon: 80.4365 },
  'Nizamabad': { lat: 18.6725, lon: 78.0941 },
  // Default bounds to center of AP/Telangana area
  'default': { lat: 17.6868, lon: 79.8988 }
};

// 1. Live Weather Integration (Open-Meteo Free API)
router.get('/weather', async (req, res) => {
  try {
    const { district } = req.query;
    const coords = DISTRICT_COORDS[district] || DISTRICT_COORDS['default'];

    // Open-Meteo public API (No key required)
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
        timezone: 'Asia/Kolkata',
        forecast_days: 5
      }
    });

    const data = response.data;
    
    // Format to match our frontend UI expectations
    const weatherCodeMap = {
      0: { icon: '☀️', text: 'Clear sky' },
      1: { icon: '🌤️', text: 'Mainly clear' },
      2: { icon: '⛅', text: 'Partly cloudy' },
      3: { icon: '☁️', text: 'Overcast' },
      61: { icon: '🌧️', text: 'Slight rain' },
      63: { icon: '🌧️', text: 'Moderate rain' },
      65: { icon: '🌧️', text: 'Heavy rain' },
      95: { icon: '⛈️', text: 'Thunderstorm' }
    };

    const currentCode = data.current.weather_code;
    const cw = weatherCodeMap[currentCode] || weatherCodeMap[0];

    // Build Daily Forecast
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast = data.daily.time.map((time, index) => {
      const date = new Date(time);
      const wcode = data.daily.weather_code[index];
      return {
        day: days[date.getDay()],
        icon: (weatherCodeMap[wcode] || weatherCodeMap[0]).icon,
        high: Math.round(data.daily.temperature_2m_max[index]),
        low: Math.round(data.daily.temperature_2m_min[index]),
        desc: (weatherCodeMap[wcode] || weatherCodeMap[0]).text,
        rain: `${data.daily.precipitation_sum[index]}mm`
      };
    });

    res.json({
      current: {
        temp: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        icon: cw.icon,
        desc: cw.text
      },
      forecast
    });
  } catch (error) {
    console.error('Weather API Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

// 2. Simulated Mandi Prices (Mocking strict Govt API)
router.get('/mandi', (req, res) => {
  // To make the demo realistic, we calculate slight fluctuations based on today's date
  const today = new Date();
  const seed = today.getDate() + today.getMonth(); // deterministic daily variance

  const basePrices = [
    { crop: 'Cotton', base: 7200, unit: 'Qtl' },
    { crop: 'Rice (Paddy)', base: 2200, unit: 'Qtl' },
    { crop: 'Wheat', base: 2400, unit: 'Qtl' },
    { crop: 'Chilli', base: 18500, unit: 'Qtl' },
    { crop: 'Maize', base: 2050, unit: 'Qtl' },
  ];

  const marketPrices = basePrices.map(item => {
    // Generate a fluctuation between -5% and +5%
    const varPerc = ((seed * item.base) % 11) - 5; 
    const currentPrice = item.base + (item.base * varPerc / 100);
    return {
      crop: item.crop,
      price: Math.round(currentPrice),
      trend: varPerc >= 0 ? '+' : '-',
      trendVal: `${Math.abs(varPerc)}%`,
      unit: item.unit
    };
  });

  res.json({ date: today.toISOString(), markets: marketPrices });
});

export default router;
