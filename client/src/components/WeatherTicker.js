import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './WeatherTicker.css';

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte'
];

const apiKey = 'aa867e2738dcd7bb242ed3c87cb55e7a';

export default function WeatherTicker() {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await Promise.all(
        cities.map(async (city) => {
          try {
            const res = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
            );
            return {
              city,
              temp: Math.round(res.data.main.temp),
              icon: `https://openweathermap.org/img/wn/${res.data.weather[0].icon}.png`,
              desc: res.data.weather[0].main
            };
          } catch {
            return { city, temp: '--', icon: '', desc: 'N/A' };
          }
        })
      );
      setWeatherData(data);
    };

    fetchWeather();
  }, []);

  return (
    <div className="weather-ticker">
      <div className="weather-scroll">
        {weatherData.map((w, i) => (
          <span className="weather-item" key={i}>
            <img src={w.icon} alt={w.desc} style={{ verticalAlign: 'middle', width: 39, height: 39, marginRight: 9 }} />
            {w.city}: {w.temp}°F {w.desc}
          </span>
        ))}
      </div>
    </div>
  );
}
