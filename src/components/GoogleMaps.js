import React, { useRef, useState, useEffect }  from 'react'
import Speech from 'speak-tts';
import axios from 'axios';
import * as Constants from '../libs/constants';


function GoogleMaps({ question, handleResumeSpeechRecognition}) {
  const speech = useRef(new Speech());
  const [locationText, setLocationText] = useState('');

  useEffect(() => {
    const curSpeech = speech.current;
    const questionWord = question.match(Constants.REGEXMAP)[0];
    console.log('questionWord:', questionWord);

    if (!questionWord) {
      handleResumeSpeechRecognition();
      return;
    }

    const queryString = question.slice(question.indexOf(questionWord) + questionWord.length).trim();
    if (!queryString) {
      handleResumeSpeechRecognition();
      return;
    }

    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${queryString}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`)
      .then(({data}) => {
        let textTTS = '';
        if(data.status !== "OK") {
          textTTS = 'Sorry, we couldn\'t find the location';
        } else {
          textTTS = `The address of ${queryString} is ${data.results[0].formatted_address}`;
        }

        setLocationText(textTTS);

        curSpeech.init({
          voice: 'Google UK English Male',
          rate: 0.8
        }).then(() => {
          curSpeech.speak({
            text: textTTS,
            listeners: {
              onend: () => {
                console.log('TTS ended');
              }
            }
          }).then(() => {
            console.log('TTS finished')
            handleResumeSpeechRecognition();
          }).catch(e => {
            console.log('TTS error')
          });
        });
    });

  }, []);
  return (
    <div>
      <h3>{locationText}</h3>
    </div>
  )
}

export default GoogleMaps
