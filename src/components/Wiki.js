import React, { Fragment, useRef, useEffect, useState }from 'react'
import Speech from 'speak-tts';
import axios from 'axios';
import * as Constants from '../libs/constants';

function Wiki({wiki}) {
  const speech = useRef(new Speech());
  const [wikiBody, setWikiBody] = useState('');

  useEffect(() => {
    const curSpeech = speech.current;
    const question = wiki.replace(Constants.REGEXWIKI, '');
    axios.get(`https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${question}`)
      .then(({data: {query: {pages}}}) => {
        const firstKey = Object.keys(pages)[0];
        const tempWikiBody = firstKey === '-1' ? `There is no information about ${question}` : pages[firstKey].extract;
        setWikiBody(tempWikiBody);

        console.log('pages:', pages)

        curSpeech.init({
          voice:'Google UK English Male'
        }).then(() => {
          curSpeech.speak({
            text: tempWikiBody
          });
        });

        return () => {
          curSpeech.cancel();
        }
      });
  }, [])

  return (
    <Fragment>
      <button type="button" className="btn btn-warning btn-block mb-4" onClick={() => {
          if(speech) {
            console.log('Speech canceled');
            speech.current.cancel();
          }
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

export default Wiki
