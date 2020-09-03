import React, { Fragment, useRef, useEffect, useState } from 'react';
import axios from 'axios';
import * as Constants from '../libs/constants';

function Wiki({wiki, handleResumeSpeechRecognition}) {
  const [wikiBody, setWikiBody] = useState('');

  useEffect(() => {
    const question = wiki.replace(Constants.REGEXWIKI, '').split(' ').map(word => word.split('').map((character, i) => i === 0 ? character.toUpperCase() : character).join('')).join(' ');
    axios.get(`https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${question}`)
      .then(({data: {query: {pages}}}) => {
        const firstKey = Object.keys(pages)[0];
        const tempWikiBody = firstKey === '-1' ? `There is no information about ${question}` : pages[firstKey].extract;

        let msg = new SpeechSynthesisUtterance();
        msg.text = tempWikiBody;

        speechSynthesis.speak(msg);
        msg.onstart = () => {
          console.log('TTS started');
        }
        msg.onend = () => {
          console.log('TTS finished');
          handleResumeSpeechRecognition();
        };
        setWikiBody(tempWikiBody);
      });
  }, [])

  return (
    <Fragment>
      <button type="button" className="btn btn-warning btn-block mb-4" onClick={() => {
          speechSynthesis.cancel();
        }}>Stop Playing Audio</button>
      {
        <div className="card mb-4" data-aos="fade-up">
          <h3 className="card-header">{wiki}</h3>
          <p className="card-body">{wikiBody}</p>
        </div>
      }
    </Fragment>
  )
}

export default Wiki;
