import React, { useEffect, useState }from 'react'
import StopPlayBtn from './StopPlayBtn'
import axios from 'axios';
import * as Constants from '../libs/constants';

function Covid({ covidQuestion, handleResumeSpeechRecognition }) {
  const [covidText, setCovidText] = useState('');
  useEffect(() => {
    // axios.get('https://api.covid19api.com/dayone/country/australia/status/confirmed/live')
      // .then(res => {
        // const covids = res.data;
        const covids = JSON.parse(Constants.COVID_TEMP);
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

        twoDaysCovids[0].map(covid => {
          covid.Cases = covid.Cases - twoDaysCovids[1].find(c => c.Province === covid.Province).Cases
        });
        console.log('twoDaysCovids:', twoDaysCovids);

        let tempTTS = twoDaysCovids[0].reduce((acc, covid, i) => acc + `${i === twoDaysCovids[0].length - 1 ? 'and ' : ''}${covid.Cases} case${covid.Cases > 1 ? 's' : ''} in ${covid.Province}${i === twoDaysCovids[0].length - 1 ? '.' : ', '}`,
            'Yesterday\'s covid-19 new cases in Australia are ');

        let msg = new SpeechSynthesisUtterance();
        msg.text = tempTTS;

        speechSynthesis.speak(msg);
        msg.onstart = () => {
          console.log('TTS started');
        }
        msg.onend = () => {
          console.log('TTS finished');
          handleResumeSpeechRecognition();
        };

        setCovidText(tempTTS);
    // });
  }, []);

  return (
    <div>
      <StopPlayBtn />
      <h3>{covidText}</h3>
    </div>
  )
}

export default Covid
