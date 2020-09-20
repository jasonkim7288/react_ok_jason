import React, { useEffect, useState }from 'react'
import StopPlayBtn from './StopPlayBtn'
import * as Constants from '../libs/constants';
import { Bar, Line } from 'react-chartjs-2';
import moment from 'moment';
import AWS from 'aws-sdk';

function Covid({ covidQuestion, handleResumeSpeechRecognition, utterance }) {
  const [chartCovidRecent, setChartCovidRecent] = useState(null);
  const [twoDaysCovidDate, setTwoDaysCovidDate] = useState('');
  const [chartCovidStatistics, setChartCovidStatistics] = useState(null);

  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  }

  useEffect(() => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    });

    const params = {
      Bucket: 'jasoncovid',
      Key: Constants.COVID_FILE_NAME
    };

    s3.getObject(params, (err, data) => {
        const {oneDayCovids, longTermCovids} = JSON.parse(data.Body.toString('ascii'));

        setTwoDaysCovidDate(oneDayCovids.date);

        const stateLabels = oneDayCovids.covids.map(covid => Constants.stateShortName[covid.Province]);
        const stateCovidNum = oneDayCovids.covids.map(covid => covid.Cases);
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
        let tempTTS = oneDayCovids.covids.reduce((acc, covid, i) => acc + `${i === oneDayCovids.covids.length - 1 ? 'and ' : ''}${covid.Cases} case${covid.Cases === 1 ? '' : 's'} in ${covid.Province}${i === oneDayCovids.covids.length - 1 ? '.' : ', '}`,
            `New cases of Covid-19 on ${oneDayCovids.date} in Australia are ...`);

        console.log('tempTTs:', tempTTS);
        utterance.text = tempTTS;
        speechSynthesis.speak(utterance);

        // long term statistics
        let months = [];
        let longTermDatasets = [];
        Object.keys(longTermCovids.covids).forEach((key, i) => {
          if (i === 0) {
            months = longTermCovids.covids[key].map(covid => moment(new Date(covid.Date)).format('MMM'));
          }

          const colorStr = `rgba(${getRandomNumber(30, 220)}, ${getRandomNumber(30, 220)}, ${getRandomNumber(30, 220)}, `

          let tempDataset = {
            label: Constants.stateShortName[longTermCovids.covids[key][0].Province],
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
          tempDataset.data = longTermCovids.covids[key].map(covid => covid.Cases);
          longTermDatasets.push(tempDataset)
        });

        setChartCovidStatistics({
          labels: months,
          datasets: longTermDatasets
        });
    });
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
