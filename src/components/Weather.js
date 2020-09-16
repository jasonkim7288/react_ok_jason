import React, { useEffect, useState, Fragment }from 'react';
import * as Constants from '../libs/constants';
import axios from 'axios';
import StopPlayBtn from './StopPlayBtn';

function Weather({question, handleResumeSpeechRecognition}) {
  const [errMsg, setErrMsg] = useState('');
  const [cityInfo, setCityInfo] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState(null);

  const fahrenheitToCelsius = (ferenheit) => Math.floor((ferenheit - 32) * 5 / 9);

  useEffect(() => {
    window.navigator.geolocation.getCurrentPosition(position => {
      axios.get(`https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${process.env.REACT_APP_ACCUWEATHER_API_KEY}&q=${position.coords.latitude},${position.coords.longitude}`)
        .then(res => {
          const cityId = res.data.Key;
          const cityName = res.data.EnglishName;
          if(!cityId) {
            setErrMsg('Counldn\'t find the city name!')
            handleResumeSpeechRecognition();
            setCityInfo(null);
            setWeatherInfo(null);
            return;
          }
          setCityInfo(res.data);
          return axios.get(`https://dataservice.accuweather.com/forecasts/v1/daily/5day/${cityId}?apikey=${process.env.REACT_APP_ACCUWEATHER_API_KEY}`)
        })
        .then(res => {
          console.log('res:', res)
          let tempWeather = {...res.data}
          tempWeather.DailyForecasts.forEach((dailyForecast, index) => {
            tempWeather.DailyForecasts[index].Temperature.Minimum.Value = fahrenheitToCelsius(dailyForecast.Temperature.Minimum.Value);
            tempWeather.DailyForecasts[index].Temperature.Maximum.Value = fahrenheitToCelsius(dailyForecast.Temperature.Maximum.Value);
            const tempDate = new Date(dailyForecast.Date);
            tempWeather.DailyForecasts[index].formattedDayOfWeek = Constants.WEEKDAY[tempDate.getDay()];
            tempWeather.DailyForecasts[index].formattedDay = `${tempDate.getDate()} / ${tempDate.getMonth()}`;
          });
          const weatherInfoForTTS = `Welcome to Jason's Weather forecast. Now, let’s see what the weather is like in ${cityName}...`
            + `Today, temperature is ${tempWeather.DailyForecasts[0].Temperature.Minimum.Value} degree to ${tempWeather.DailyForecasts[0].Temperature.Maximum.Value} degree.`
            + ` It will be ${tempWeather.DailyForecasts[0].Day.IconPhrase} for most of the day,`
            + ` and, ${tempWeather.DailyForecasts[0].Night.IconPhrase} in the evening.`
            + ` Tomorrow, temperature is ${tempWeather.DailyForecasts[1].Temperature.Minimum.Value} degree to ${tempWeather.DailyForecasts[1].Temperature.Maximum.Value} degree.`
            + ` It will be ${tempWeather.DailyForecasts[1].Day.IconPhrase} for most of the day,`
            + ` and, ${tempWeather.DailyForecasts[1].Night.IconPhrase} in the evening.`;

          let msg = new SpeechSynthesisUtterance();
          msg.text = weatherInfoForTTS;

          speechSynthesis.speak(msg);
          msg.onstart = () => {
            console.log('TTS started');
          }
          msg.onend = () => {
            console.log('TTS finished');
            handleResumeSpeechRecognition();
          };

          setWeatherInfo(tempWeather);
      });
    });

  }, []);

  return (
    <div>
      <h3>{errMsg}</h3>
      {
        cityInfo && weatherInfo &&
        <Fragment>
          <StopPlayBtn />
          <h2 className="text-center">{cityInfo.EnglishName}</h2>
          {
            weatherInfo.DailyForecasts.map((dailyForecast,i) =>
              <div className="card mb-4" key={`forecast_${i}`} data-aos={i % 2 === 0 ? "fade-right": "fade-left"}>
                <div className="row d-flex align-items-center justify-content-center">
                  <div className="col-3 col-sm-3 col-md-2">
                    <div className="text-center"><strong>{dailyForecast.formattedDayOfWeek}</strong></div>
                    <div className="text-center">{dailyForecast.formattedDay}</div>
                  </div>
                  <img className="col-3 col-sm-2 col-md-2 py-3" style={{maxWidth: "100px"}} src={`https://www.accuweather.com/images/weathericons/${dailyForecast.Day.Icon}.svg`} alt=""/>
                  <div className="col-5 col-sm-3 col-md-2">
                    <span style={{fontSize: '2em'}}>{`${dailyForecast.Temperature.Maximum.Value}\u00b0`}</span>
                    <span style={{fontSize: '1.2em'}}>{`/ ${dailyForecast.Temperature.Minimum.Value}\u00b0`}</span>
                  </div>
                  <div className="col-12 col-sm-12 col-md-5 mb-3 mb-md-0 px-sm-0 text-center" style={{fontSize: '1.5em'}}>{dailyForecast.Day.IconPhrase}</div>
                </div>
              </div>
            )
          }
        </Fragment>
      }
    </div>
  )
};

export default Weather;
