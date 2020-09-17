import React, { useEffect, useState, Fragment} from 'react';
import axios from 'axios';
import StopPlayBtn from './StopPlayBtn';

function Jokes({ question, handleResumeSpeechRecognition}) {
  const [jokesBody, setJokesBody] = useState('');

  useEffect(() => {
    console.log('question:', question)
    axios.get('https://icanhazdadjoke.com/', {
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(res => {
        const tempJoke = res.data.joke;
        let msg = new SpeechSynthesisUtterance();
        msg.text = tempJoke;

        speechSynthesis.speak(msg);
        msg.onstart = () => {
          console.log('TTS started');
        }
        msg.onend = () => {
          console.log('TTS finished');
          handleResumeSpeechRecognition();
        };
        setJokesBody(tempJoke);
      })
  }, []);

  return (
    <Fragment>
      <StopPlayBtn />
      {
        <div className="card mb-4" data-aos="fade-up">
          <h3 className="card-header">{question}</h3>
          <p className="card-body">{jokesBody}</p>
        </div>
      }
    </Fragment>
  )
};

export default Jokes;
