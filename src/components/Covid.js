import React, { useEffect, useState }from 'react'
import StopPlayBtn from './StopPlayBtn'
import axios from 'axios';
import * as Constants from '../libs/constants';
import { Bar, Line } from 'react-chartjs-2';
import moment from 'moment';

function Covid({ covidQuestion, handleResumeSpeechRecognition }) {
  const [covidText, setCovidText] = useState('');
  const [chartCovidRecent, setChartCovidRecent] = useState(null);
  const [twoDaysCovidDate, setTwoDaysCovidDate] = useState('');
  const [chartCovidStatistics, setChartCovidStatistics] = useState(null);

  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  }

  useEffect(() => {
    // axios.get('https://api.covid19api.com/dayone/country/australia/status/confirmed/live')
      // .then(res => {
        // const covids = res.data;
        const covids = JSON.parse(Constants.COVID_TEMP);

        // get last 2 days info and subtract cases to get the latest 24 hours cases
        let twoDaysCovids = new Array(2).fill(0).map(a => []);
        let index = 0;
        twoDaysCovids[index].unshift({...covids[covids.length - 1]});
        for (let i = covids.length - 2; i >= 0; i--) {
          if (covids[i + 1].Date !== covids[i].Date) {
            index++;
            if (index > 1) {
              break;
            }
          }
          twoDaysCovids[index].unshift({...covids[i]});
        }

        twoDaysCovids[0].forEach(covid => {
          covid.Cases = covid.Cases - twoDaysCovids[1].find(c => c.Province === covid.Province).Cases
        });

        const tempDate = moment(new Date(twoDaysCovids[0][0].Date)).format('dddd, DD MMMM YYYY');
        setTwoDaysCovidDate(tempDate);

        const stateLabels = twoDaysCovids[0].map(covid => Constants.stateShortName[covid.Province]);
        const stateCovidNum = twoDaysCovids[0].map(covid => covid.Cases);
        setChartCovidRecent({
          labels: stateLabels,
          datasets: [
            {
              label: 'Number of new cases',
              data: stateCovidNum,
              backgroundColor: 'rgba(255,99,132,0.2)',
              borderColor: 'rgba(255,99,132,1)',
              borderWidth: 1,
              hoverBackgroundColor: 'rgba(255,99,132,0.4)',
              hoverBorderColor: 'rgba(255,99,132,1)',
            }
          ]
        });

        // make text for TTS
        let tempTTS = twoDaysCovids[0].reduce((acc, covid, i) => acc + `${i === twoDaysCovids[0].length - 1 ? 'and ' : ''}${covid.Cases} case${covid.Cases === 1 ? '' : 's'} in ${covid.Province}${i === twoDaysCovids[0].length - 1 ? '.' : ', '}`,
            `New cases of Covid-19 on ${tempDate} in Australia are ...`);

        let msg = new SpeechSynthesisUtterance();
        msg.text = tempTTS;
        msg.rate = 0.7;

        speechSynthesis.speak(msg);
        msg.onstart = () => {
          console.log('TTS started');
        }
        msg.onend = () => {
          console.log('TTS finished');
          handleResumeSpeechRecognition();
        };

        setCovidText(tempTTS);

        // 6 months statistics
        let sixMonthsCovids = {}
        index = 0;
        for (let i = covids.length - 1; i >= 0; i--) {
          if (!sixMonthsCovids[covids[i].Province]) {
            sixMonthsCovids[covids[i].Province] = [{...covids[i]}];
          } else if (new Date(sixMonthsCovids[covids[i].Province][0].Date).getMonth() === new Date(covids[i].Date).getMonth()) {
            continue;
          } else if (sixMonthsCovids[covids[i].Province].length >= 7) {
            break;
          } else {
            sixMonthsCovids[covids[i].Province][0].Cases -= covids[i].Cases;
            sixMonthsCovids[covids[i].Province].unshift({...covids[i]});
          }
        }

        console.log(sixMonthsCovids);

        let months = [];
        let sixMonthsDatasets = [];
        Object.keys(sixMonthsCovids).forEach((key, i) => {
          if (i === 0) {
            months = sixMonthsCovids[key].map(covid => moment(new Date(covid.Date)).format('MMM'));
          }

          const colorStr = `rgba(${getRandomNumber(30, 220)}, ${getRandomNumber(30, 220)}, ${getRandomNumber(30, 220)}, `

          let tempDataset = {
            label: Constants.stateShortName[sixMonthsCovids[key][0].Province],
            fill: false,
            backgroundColor: `${colorStr}0.4)`,
            borderColor: `${colorStr}1)`,
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: `${colorStr}1)`,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: `${colorStr}1)`,
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: []
          };
          tempDataset.data = sixMonthsCovids[key].map(covid => covid.Cases);
          sixMonthsDatasets.push(tempDataset)
        });

        setChartCovidStatistics({
          labels: months,
          datasets: sixMonthsDatasets
        });


    // });
  }, []);

  return (
    <div>
      <StopPlayBtn />
      <h3 className="text-center">{`New cases of covid-19 on ${twoDaysCovidDate}`}</h3>
      <div className="mx-auto mb-5">
        { chartCovidRecent &&
          <Bar data={chartCovidRecent}
            options = {{
              scales: {
                xAxes: [
                  {
                    gridLines: {
                      drawOnChartArea: false
                    }
                  }
                ]
              }
            }}
          />
        }
      </div>
      <h3 className="text-center">{`Last 6 months statistics of covid-19`}</h3>
      <div className="mx-auto">
        {
          chartCovidStatistics &&
          <Line data={chartCovidStatistics} />
        }
      </div>
    </div>
  )
}

export default Covid
