import React, { useState, useEffect, useRef, Fragment } from 'react';
import './App.css';
import News from './components/News';
import MyModal from './components/MyModal';
import Wiki from './components/Wiki';
import * as Constants from './libs/constants'
import Weather from './components/Weather';
import GoogleMap from './components/GoogleMaps';
import Covid from './components/Covid';
import Jokes from './components/Jokes';


function App() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  const speechOnAudio = new Audio(process.env.PUBLIC_URL + '/SpeechOn.wav');
  // const speechEndAudio = new Audio(process.env.PUBLIC_URL + '/SpeechEnd.wav');
  const utteranceRef = useRef(null);
  const voicesRef = useRef([]);

  const [curStage, setCurStage] = useState(Constants.CurStage.BeforeTrigger);
  const [checkRestart, setCheckRestart] = useState(false);
  const [matchCmd, setMatchCmd] = useState('');
  const [newsQuestion, setNewsQuestion] = useState('');
  const [wikiQuestion, setWikiQuestion] = useState('');
  const [weatherQuestion, setWeatherQuestion] = useState('');
  const [mapQuestion, setMapQuestion] = useState('');
  const [covidQuestion, setCovidQuestion] = useState('');
  const [jokesQuestion, setJokesQuestion] = useState('');
  const [triggerWord, setTriggerWord] = useState('OK Jason');
  const isStarting = useRef(false);

  recognition.interimResults = true;
  recognition.lang = 'en-US';

  // window.speechSynthesis.onvoicechanged = () => {
  //   voicesRef.current = window.speechSynthesis.getVoices();
  //   console.log('voices are ready', voicesRef.current);
  // }

  // choose gender depending on the wake words
  const changeGender = (gender) => {
    if (voicesRef.current.length === 0) {
      console.log('no voices list')
    } else {
      const matchedVoice = voicesRef.current.findIndex(voice => voice.name.toLowerCase().includes('english ' + gender));
      if (matchedVoice === -1) {
        console.log('gender didn\'t match any voice')
      } else {
        utteranceRef.current.voice = voicesRef.current[matchedVoice];
      }
    }
  }

  // tricky handling to play sound without User interaction later
  const handleInitiateAudioClick = (gender = 'male') => {
    console.log('handleInitiateAudioClick');

    utteranceRef.current = new SpeechSynthesisUtterance();
    // changeGender(gender);

    utteranceRef.current.onstart = () => {
      console.log('TTS started');
    }
    utteranceRef.current.onend = () => {
      console.log('TTS finished');
      handleResumeSpeechRecognition();
    };

    // setCurStage(Constants.CurStage.AfterTrigger);
    // setMatchCmd('covid-19');
    // return;

    speechOnAudio.play().then(() => {
      speechOnAudio.pause();
      recognition.start();
    });

  }


  // When finishing each response, start speech recognition again to get another 'ok jason'
  const handleResumeSpeechRecognition = () => {
    if (isStarting.current === true) {
      console.log('handleResumeSpeechRecognition, but doesn\'t do anything due to the duplication');
      return;
    }
    console.log('handleResumeSpeechRecognition')

    setCurStage(Constants.CurStage.BeforeTrigger);
    setMatchCmd('');
    setCheckRestart(false);
    recognition.start();
  };

  // speech recognition event listeners
  recognition.addEventListener('result', e => {
    const transcript = [...e.results].map(result => result[0].transcript).join('');

    if (e.results[0].isFinal) {
      setMatchCmd(transcript)
    }
  });

  recognition.addEventListener('start', () => {
    console.log('Speech recognition started');
    isStarting.current = true;
  });

  recognition.addEventListener('end', () => {
    console.log("Speech recognition ended, checkRestart = " + checkRestart);
    isStarting.current = false;
    setCheckRestart(true);
  });

  // useEffect series
  useEffect(() => {
    console.log(window);

    window.AOS.init({
      duration: 1500
    });

    window.speechSynthesis.getVoices();

    setTimeout(() => {
      voicesRef.current = window.speechSynthesis.getVoices();
      console.log('voices are ready', voicesRef.current);
    }, 100);
  }, []);

  useEffect(() => {
    const handleCurrentStage = () => {
      switch (curStage) {
        case Constants.CurStage.BeforeTrigger:
          console.log('BeforeTrigger is set')
          break;
        case Constants.CurStage.AfterTrigger:
          console.log('AfterTrigger is set')
          break;
        case Constants.CurStage.DuringProcessing:
          console.log('DuringProcessing is set')
          break;
        default:
          break;
      }
    }
    handleCurrentStage();
  }, [curStage]);

  useEffect(() => {
    const handleCheckRestart = () => {
      console.log(`handleCheckRestart, checkRestart = ${checkRestart}, curStage = ${curStage}`);
      if (checkRestart) {
        if (curStage === Constants.CurStage.BeforeTrigger) {
          setCheckRestart(false);
          recognition.start();
        } else if (curStage === Constants.CurStage.AfterTriggerFirst) {
          setCheckRestart(false);
          recognition.start();
          setCurStage(Constants.CurStage.AfterTrigger);
        } else if (curStage === Constants.CurStage.AfterTrigger) {
          handleResumeSpeechRecognition();
        }
      }
    };
    handleCheckRestart();
  }, [checkRestart]);

  useEffect(() => {
    const handleMatchCmd = () => {
      if (matchCmd === '') {
        return;
      }

      console.log(`handleMatchCmd, curStage = ${curStage}`);
      const transcriptCompare = matchCmd.toLowerCase();
      console.log(`transcriptCompare: ${transcriptCompare}, triggerWord: ${triggerWord}`)

      switch (curStage) {
        case Constants.CurStage.BeforeTrigger:
          if (transcriptCompare === triggerWord.toLowerCase()) {
            speechOnAudio.play();
            setNewsQuestion('');
            setCurStage(Constants.CurStage.AfterTriggerFirst);
            setMatchCmd('');
            setWikiQuestion('');
            setWeatherQuestion('');
            setMapQuestion('');
            setCovidQuestion('');
            setJokesQuestion('');
          }
          break;
        case Constants.CurStage.AfterTrigger:
          if (transcriptCompare.includes('news')) {
            setCurStage(Constants.CurStage.DuringProcessing);
            setNewsQuestion(matchCmd);
          } else if (transcriptCompare.includes('unicorn')) {
            if (transcriptCompare.includes('delete') || transcriptCompare.includes('remove') || transcriptCompare.includes('get rid of')) {
              document.querySelectorAll('.__cornify_unicorn').forEach(unicorn => {
                unicorn.parentNode.removeChild(unicorn);
              });
              const unicorn = document.getElementById('__cornify_count');
              unicorn && unicorn.parentNode.removeChild(unicorn);
            } else {
              window.cornify_add();
              window.cornify_add();
              window.cornify_add();
            }
            handleResumeSpeechRecognition();
          } else if (transcriptCompare.includes('weather')) {
            setCurStage(Constants.CurStage.DuringProcessing);
            setWeatherQuestion(matchCmd);
          } else if (Constants.REGEXMAP.test(transcriptCompare)) {
            setCurStage(Constants.CurStage.DuringProcessing);
            setMapQuestion(matchCmd);
          } else if (Constants.REGEXWIKI.test(transcriptCompare)) {
            setCurStage(Constants.CurStage.DuringProcessing);
            setWikiQuestion(matchCmd);
          } else if (transcriptCompare.includes('covid-19')) {
            setCurStage(Constants.CurStage.DuringProcessing);
            setCovidQuestion(matchCmd);
          } else if (transcriptCompare.includes('joke')) {
            setCurStage(Constants.CurStage.DuringProcessing);
            setJokesQuestion(matchCmd);
          } else {
            handleResumeSpeechRecognition();
          }
          break;
        default:
          break;
      }
    };
    handleMatchCmd();
  }, [matchCmd]);

  return (
    <div className="mb-4">
      <div className="jumbotron py-4">
        <MyModal handleInitiateAudioClick={handleInitiateAudioClick} setTriggerWord={setTriggerWord} />
        <div className="display-4 text-center">
          {
            curStage === Constants.CurStage.BeforeTrigger &&
            <Fragment>Say <a href="/" className="text-primary">{`"${triggerWord}"`}</a></Fragment>
          }
          {
            curStage === Constants.CurStage.AfterTrigger &&
            <Fragment>Ask any Question</Fragment>
          }
          {
            curStage === Constants.CurStage.DuringProcessing &&
            "Playing sound..."
          }
        </div>
        <div className={`text-center display-3 mb-2
            ${curStage === Constants.CurStage.BeforeTrigger ? "text-primary" : (curStage === Constants.CurStage.AfterTrigger || curStage === Constants.CurStage.AfterTriggerFirst ? "text-danger" : "text-dark")}`}>
          <i className="fas fa-microphone-alt"></i>
        </div>
        <p className="text-center">{matchCmd || '...'}</p>
      </div>
      <div className="container">
        {!newsQuestion && !wikiQuestion && !weatherQuestion && !mapQuestion && !covidQuestion && !jokesQuestion &&
          <Fragment>
            <h3 className="text-center">You can ask</h3>
            <h3 className="text-center font-weight-light">"What is the weather today?"</h3>
            {/* News API is not free for a real website. It only works on localhost for free */}
            <h3 className="text-center font-weight-light">
              <span style={{ textDecoration: "line-through red" }}>"Tell me today's newsQuestion."</span>
              <span className="pl-3" style={{ fontSize: "0.6em" }}>(News API is free only on localhost)</span>
            </h3>
            <h3 className="text-center font-weight-light">"Who is Adam Sandler?"</h3>
            <h3 className="text-center font-weight-light">"Where is Coder Academy in Brisbane?"</h3>
            <h3 className="text-center font-weight-light">"Show me the cases of Covid-19"</h3>
            <h3 className="text-center font-weight-light">"Tell me a joke"</h3>
            <h3 className="text-center font-weight-light">"Show me some unicorns."</h3>
            <h3 className="text-center font-weight-light">"Remove all unicorns."</h3>

          </Fragment>
        }
        {newsQuestion && <News question={newsQuestion} handleResumeSpeechRecognition={handleResumeSpeechRecognition} utterance={utteranceRef.current}/>}
        {wikiQuestion && <Wiki question={wikiQuestion} handleResumeSpeechRecognition={handleResumeSpeechRecognition} utterance={utteranceRef.current}/>}
        {weatherQuestion && <Weather question={weatherQuestion} handleResumeSpeechRecognition={handleResumeSpeechRecognition} utterance={utteranceRef.current}/>}
        {mapQuestion && <GoogleMap question={mapQuestion} handleResumeSpeechRecognition={handleResumeSpeechRecognition} utterance={utteranceRef.current}/>}
        {covidQuestion && <Covid question={covidQuestion} handleResumeSpeechRecognition={handleResumeSpeechRecognition} utterance={utteranceRef.current}/>}
        {jokesQuestion && <Jokes question={jokesQuestion} handleResumeSpeechRecognition={handleResumeSpeechRecognition} utterance={utteranceRef.current}/>}
      </div>
    </div>
  );
}

export default App;