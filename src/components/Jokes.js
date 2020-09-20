import React, { useEffect, useState, Fragment} from 'react';
import axios from 'axios';
import StopPlayBtn from './StopPlayBtn';

function Jokes({ question, handleResumeSpeechRecognition, utterance}) {
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

        utterance.text = tempJoke;
        speechSynthesis.speak(utterance);

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
