import React, { useState, useEffect } from 'react';
import './App.css';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog, WiDayCloudyHigh } from 'react-icons/wi';
import { FaTemperatureHigh, FaTint, FaWind, FaCompressAlt, FaEye, FaMapMarkerAlt } from 'react-icons/fa';
import { BsSunrise, BsSunset, BsMoonStars } from 'react-icons/bs';
import { IoMdAirplane, IoMdMedical } from 'react-icons/io';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');

  const API_KEY = 'cb0ca47163a64acb9ff131640251906';
  const GEMINI_API_KEY = 'AIzaSyAGQDvQzbpc_JM2SkNfRYDzwPMbIpuNRwE';

  const fetchWeatherData = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=yes&alerts=yes`
      );
      const data = await response.json();
      
      if (data.error) {
        setError(data.error.message);
        setWeatherData(null);
      } else {
        setWeatherData(data);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    const weatherIcons = {
      1000: <WiDaySunny />, // Sun
      1003: <WiDayCloudyHigh />, // 
      1006: <WiCloudy />, // Clouff
      1009: <WiCloudy />, // Over
      1030: <WiFog />, // Mist
      1063: <WiRain />, // Patchy rain poss
      1066: <WiSnow />, // Patchy snow poss
      1069: <WiSnow />, // Patchy sleet possib
      1072: <WiRain />, // Patchy freezing driz
      1087: <WiThunderstorm />, // Thundery outbre
      1114: <WiSnow />, // Blowing snow
      1117: <WiSnow />, // Blizzar
      1135: <WiFog />, // Fog
      1147: <WiFog />, // Freezing fog
      1150: <WiRain />, // Patchy light drizzle
      1153: <WiRain />, // Light drizzle
      1168: <WiRain />, // Freezing drizzle
      1171: <WiRain />, // Heavy freezing drizzle
      1180: <WiRain />, // Patchy light rain
      1183: <WiRain />, // Light rain
      1186: <WiRain />, // Moderate rain at times
      1189: <WiRain />, // Moderate rain
      1192: <WiRain />, // Heavy rain at times
      1195: <WiRain />, // Heavy rain
      1198: <WiRain />, // Light freezing rain
      1201: <WiRain />, // Moderate or heavy freezing rain
      1204: <WiSnow />, // Light sleet
      1207: <WiSnow />, // Moderate or heavy sleet
      1210: <WiSnow />, // Patchy light snow
      1213: <WiSnow />, // Light snow
      1216: <WiSnow />, // Patchy moderate snow
      1219: <WiSnow />, // Moderate snow
      1222: <WiSnow />, // Patchy heavy snow
      1225: <WiSnow />, // Heavy snow
      1237: <WiSnow />, // Ice pellets
      1240: <WiRain />, // Light rain shower
      1243: <WiRain />, // Moderate or heavy rain shower
      1246: <WiRain />, // Torrential rain shower
      1249: <WiSnow />, // Light sleet showers
      1252: <WiSnow />, // Moderate or heavy sleet showers
      1255: <WiSnow />, // Light snow showers
      1258: <WiSnow />, // Moderate or heavy snow showers
      1261: <WiSnow />, // Light showers of ice pellets
      1264: <WiSnow />, // Moderate or heavy showers of ice pellets
      1273: <WiThunderstorm />, // Patchy light rain with thunder
      1276: <WiThunderstorm />, // Moderate or heavy rain with thunder
      1279: <WiThunderstorm />, // Patchy light snow with thunder
      1282: <WiThunderstorm />, // Moderate or heavy snow with thunder
    };

    return weatherIcons[code] || <WiDaySunny />;
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || !weatherData) return;

    const userMsg = { text: userMessage, sender: 'user' };
    setChatMessages([...chatMessages, userMsg]);
    setUserMessage('');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a weather assistant. The user is in ${weatherData.location.name}, ${weatherData.location.country}. Current weather is ${weatherData.current.condition.text}, temperature is ${weatherData.current.temp_c}°C. Humidity is ${weatherData.current.humidity}%, wind speed is ${weatherData.current.wind_kph} kph. The user asked: "${userMessage}". Provide a helpful response.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const botResponse = data.candidates[0].content.parts[0].text;
      setChatMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { text: "Sorry, I couldn't process your request. Please try again.", sender: 'bot' }]);
    }
  };

  const generateAiAnalysis = async () => {
    if (!weatherData) return;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze this weather data for ${weatherData.location.name}, ${weatherData.location.country} and provide a detailed report including:
                1. Travel recommendations (is it good for travel? any precautions?)
                2. Health considerations (any health risks due to weather conditions?)
                3. General weather summary
                4. Any alerts or warnings
                
                Weather data:
                - Current: ${weatherData.current.condition.text}, ${weatherData.current.temp_c}°C
                - Feels like: ${weatherData.current.feelslike_c}°C
                - Humidity: ${weatherData.current.humidity}%
                - Wind: ${weatherData.current.wind_kph} kph, ${weatherData.current.wind_dir}
                - UV index: ${weatherData.current.uv}
                - Air quality: ${weatherData.current.air_quality['us-epa-index']}
                - Forecast: ${weatherData.forecast.forecastday.map(day => `${day.date}: ${day.day.condition.text}, High ${day.day.maxtemp_c}°C, Low ${day.day.mintemp_c}°C`).join('\n')}
                - Alerts: ${weatherData.alerts?.alert?.map(alert => alert.headline).join(', ') || 'None'}
                `
              }]
            }]
          })
        }
      );

      const data = await response.json();
      setAiAnalysis(data.candidates[0].content.parts[0].text);
    } catch (err) {
      setAiAnalysis("Failed to generate AI analysis. Please try again.");
    }
  };

  useEffect(() => {
    if (activeTab === 'ai-analysis' && weatherData && !aiAnalysis) {
      generateAiAnalysis();
    }
  }, [activeTab]);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-logo">WeatherAI</div>
        <ul className="nav-links">
          <li className={activeTab === 'current' ? 'active' : ''} onClick={() => setActiveTab('current')}>Current Weather</li>
          <li className={activeTab === 'air-quality' ? 'active' : ''} onClick={() => setActiveTab('air-quality')}>Air Quality</li>
          <li className={activeTab === 'astronomy' ? 'active' : ''} onClick={() => setActiveTab('astronomy')}>Astronomy</li>
          <li className={activeTab === 'location' ? 'active' : ''} onClick={() => setActiveTab('location')}>Location Data</li>
          <li className={activeTab === 'statistics' ? 'active' : ''} onClick={() => setActiveTab('statistics')}>Statistics</li>
          <li className={activeTab === 'ai-analysis' ? 'active' : ''} onClick={() => setActiveTab('ai-analysis')}>AI Weather Analysis</li>
          <li className={activeTab === 'chatbot' ? 'active' : ''} onClick={() => setActiveTab('chatbot')}>Weather Bot</li>
        </ul>
      </nav>

      <div className="container">
        <h1 className="app-title">Weather App Project for Visual Programming</h1>
        
        <div className="search-container">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter your city name"
            className="search-input"
          />
          <button onClick={fetchWeatherData} className="search-button" disabled={loading}>
            {loading ? 'Loading...' : 'Let\'s Go'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {weatherData && (
          <div className="weather-container">
            {activeTab === 'current' && (
              <div className="current-weather">
                <div className="weather-header">
                  <h2>{weatherData.location.name}, {weatherData.location.country}</h2>
                  <p>{weatherData.location.localtime}</p>
                </div>
                <div className="weather-main">
                  <div className="weather-icon">
                    {getWeatherIcon(weatherData.current.condition.code)}
                    <span>{weatherData.current.condition.text}</span>
                  </div>
                  <div className="weather-temp">
                    <h1>{weatherData.current.temp_c}°C</h1>
                    <p>Feels like: {weatherData.current.feelslike_c}°C</p>
                  </div>
                </div>
                <div className="weather-details">
                  <div className="detail-item">
                    <FaTint />
                    <span>Humidity: {weatherData.current.humidity}%</span>
                  </div>
                  <div className="detail-item">
                    <FaWind />
                    <span>Wind: {weatherData.current.wind_kph} kph {weatherData.current.wind_dir}</span>
                  </div>
                  <div className="detail-item">
                    <FaCompressAlt />
                    <span>Pressure: {weatherData.current.pressure_mb} mb</span>
                  </div>
                  <div className="detail-item">
                    <FaEye />
                    <span>Visibility: {weatherData.current.vis_km} km</span>
                  </div>
                  <div className="detail-item">
                    <FaTemperatureHigh />
                    <span>UV Index: {weatherData.current.uv}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'air-quality' && (
              <div className="air-quality">
                <h2>Air Quality Information</h2>
                <div className="aqi-container">
                  <div className="aqi-item">
                    <h3>US EPA Standard</h3>
                    <p className={`aqi-value aqi-${weatherData.current.air_quality['us-epa-index']}`}>
                      {['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'][weatherData.current.air_quality['us-epa-index'] - 1]}
                    </p>
                  </div>
                  <div className="aqi-details">
                    <div className="aqi-detail">
                      <span>Carbon Monoxide (CO):</span>
                      <span>{weatherData.current.air_quality.co.toFixed(2)}</span>
                    </div>
                    <div className="aqi-detail">
                      <span>Ozone (O3):</span>
                      <span>{weatherData.current.air_quality.o3.toFixed(2)}</span>
                    </div>
                    <div className="aqi-detail">
                      <span>Nitrogen Dioxide (NO2):</span>
                      <span>{weatherData.current.air_quality.no2.toFixed(2)}</span>
                    </div>
                    <div className="aqi-detail">
                      <span>Sulfur Dioxide (SO2):</span>
                      <span>{weatherData.current.air_quality.so2.toFixed(2)}</span>
                    </div>
                    <div className="aqi-detail">
                      <span>PM2.5:</span>
                      <span>{weatherData.current.air_quality.pm2_5.toFixed(2)}</span>
                    </div>
                    <div className="aqi-detail">
                      <span>PM10:</span>
                      <span>{weatherData.current.air_quality.pm10.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'astronomy' && (
              <div className="astronomy">
                <h2>Astronomy Data</h2>
                <div className="astro-container">
                  <div className="astro-item">
                    <BsSunrise />
                    <div>
                      <h3>Sunrise</h3>
                      <p>{weatherData.forecast.forecastday[0].astro.sunrise}</p>
                    </div>
                  </div>
                  <div className="astro-item">
                    <BsSunset />
                    <div>
                      <h3>Sunset</h3>
                      <p>{weatherData.forecast.forecastday[0].astro.sunset}</p>
                    </div>
                  </div>
                  <div className="astro-item">
                    <BsMoonStars />
                    <div>
                      <h3>Moon Phase</h3>
                      <p>{weatherData.forecast.forecastday[0].astro.moon_phase}</p>
                    </div>
                  </div>
                  <div className="astro-item">
                    <BsMoonStars />
                    <div>
                      <h3>Moonrise</h3>
                      <p>{weatherData.forecast.forecastday[0].astro.moonrise}</p>
                    </div>
                  </div>
                  <div className="astro-item">
                    <BsMoonStars />
                    <div>
                      <h3>Moonsett</h3>
                      <p>{weatherData.forecast.forecastday[0].astro.moonset}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="location-data">
                <h2>Location Information</h2>
                <div className="location-container">
                  <div className="location-item">
                    <FaMapMarkerAlt />
                    <div>
                      <h3>Location</h3>
                      <p>{weatherData.location.name}, {weatherData.location.region}, {weatherData.location.country}</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <FaMapMarkerAlt />
                    <div>
                      <h3>Coordinates</h3>
                      <p>Latitude: {weatherData.location.lat}, Longitude: {weatherData.location.lon}</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <FaMapMarkerAlt />
                    <div>
                      <h3>Timezone</h3>
                      <p>{weatherData.location.tz_id}</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <FaMapMarkerAlt />
                    <div>
                      <h3>Local Time</h3>
                      <p>{weatherData.location.localtime}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="statistics">
                <h2>Weather Statistics</h2>
                <div className="stats-container">
                  <div className="meteogram">
                    <h3>Meteogram</h3>
                    <img 
                      src={`https://my.meteoblue.com/visimage/meteogram_web?apikey=NP31JjGwiEgH5q7o&lat=${weatherData.location.lat}&lon=${weatherData.location.lon}&lang=en&units=metric`} 
                      alt="Meteogram" 
                    />
                  </div>
                  <div className="windy-map">
                    <h3>Wind & Satellite Map</h3>
                    <iframe 
                      src={`https://embed.windy.com/embed2.html?lat=${weatherData.location.lat}&lon=${weatherData.location.lon}&detailLat=${weatherData.location.lat}&detailLon=${weatherData.location.lon}&width=650&height=450&zoom=5&level=surface&overlay=satellite&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                      frameBorder="0"
                    ></iframe>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai-analysis' && (
              <div className="ai-analysis">
                <h2>AI Weather Analysis</h2>
                {aiAnalysis ? (
                  <div className="analysis-content">
                    <div className="analysis-section">
                      <IoMdAirplane />
                      <h3>Travel Recommendations</h3>
                      <p>{aiAnalysis.split('1. Travel recommendations')[1]?.split('2. Health considerations')[0] || 'Loading...'}</p>
                    </div>
                    <div className="analysis-section">
                      <IoMdMedical />
                      <h3>Health Considerations</h3>
                      <p>{aiAnalysis.split('2. Health considerations')[1]?.split('3. General weather summary')[0] || 'Loading...'}</p>
                    </div>
                    <div className="analysis-section">
                      <WiDaySunny />
                      <h3>Weather Summary</h3>
                      <p>{aiAnalysis.split('3. General weather summary')[1]?.split('4. Any alerts or warnings')[0] || 'Loading...'}</p>
                    </div>
                    <div className="analysis-section">
                      <FaCompressAlt />
                      <h3>Alerts & Warnings</h3>
                      <p>{aiAnalysis.split('4. Any alerts or warnings')[1] || 'Loading...'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="loading-analysis">Generating AI analysis...</div>
                )}
              </div>
            )}

            {activeTab === 'chatbot' && (
              <div className="chatbot">
                <h2>Weather Assistant</h2>
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatMessages.length === 0 ? (
                      <div className="welcome-message">
                        <p>Hello! I'm your weather assistant. Ask me anything about the weather in {weatherData.location.name}.</p>
                        <p>Try questions like:</p>
                        <ul>
                          <li>What should I wear today?</li>
                          <li>Is it going to rain later?</li>
                          <li>How's the air quality?</li>
                        </ul>
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`}>
                          {msg.text}
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleChatSubmit} className="chat-input">
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="Ask about the weather..."
                    />
                    <button type="submit">Send</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;