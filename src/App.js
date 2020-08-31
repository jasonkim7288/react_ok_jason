import React, { useState, useEffect, useRef, Fragment} from 'react';
import './App.css';
import axios from 'axios';
import News from './components/News';
import MyModal from './components/MyModal';
import Wiki from './components/Wiki';
import * as Constants from './libs/constants'
import Weather from './components/Weather';

function App() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  const speechOnAudio = new Audio(process.env.PUBLIC_URL + '/SpeechOn.wav');
  // const speechEndAudio = new Audio(process.env.PUBLIC_URL + '/SpeechEnd.wav');

  const [curStage, setCurStage] = useState(Constants.CurStage.BeforeTrigger);
  const [checkRestart, setCheckRestart] = useState(false);
  const [matchCmd, setMatchCmd] = useState('');
  const [news, setNews] = useState(null);
  const [wiki, setWiki] = useState('');
  const [weatherQuestion, setWeatherQuestion] = useState('');
  const isStarting = useRef(false);

  recognition.interimResults = true;
  recognition.lang = 'en-US';

  // tricky handling to play sound without User interaction later
  const handleInitiateAudioClick = () => {
    console.log('handleInitiateAudioClick');

    // setCurStage(Constants.CurStage.AfterTrigger);
    // setMatchCmd('weather');
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

  // recognition event listeners
  recognition.addEventListener('result', e => {
    const transcript = [...e.results].map(result => result[0].transcript).join('');

    if(e.results[0].isFinal) {
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
      duration: 1500,
      offset: 200
    });
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
      if(checkRestart) {
        if(curStage === Constants.CurStage.BeforeTrigger) {
          setCheckRestart(false);
          recognition.start();
        } else if(curStage === Constants.CurStage.AfterTriggerFirst) {
          setCheckRestart(false);
          recognition.start();
          setCurStage(Constants.CurStage.AfterTrigger);
        } else if(curStage === Constants.CurStage.AfterTrigger) {
          handleResumeSpeechRecognition();
        }
      }
    };
    handleCheckRestart();
  }, [checkRestart]);

  useEffect(() => {
    const handleMatchCmd = () => {
      if(matchCmd === '') {
        return;
      }

      console.log(`handleMatchCmd, curStage = ${curStage}`);
      const transcriptCompare = matchCmd.toLowerCase();
      console.log('transcriptCompare:', transcriptCompare)

      switch(curStage) {
        case Constants.CurStage.BeforeTrigger:
          if (transcriptCompare === 'ok jason') {
            speechOnAudio.play();
            setNews(null);
            setCurStage(Constants.CurStage.AfterTriggerFirst);
            setMatchCmd('');
            setWiki('');
            setWeatherQuestion('');
          }
          break;
        case Constants.CurStage.AfterTrigger:
          if (transcriptCompare.includes('news')) {
            axios.get(`https://newsapi.org/v2/top-headlines?country=au&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`)
              .then((res) => {
                let tempNews = res.data.articles.map(news => {
                  news.content = news.content && news.content.replace(/… \[\+\d+ chars\]/, '');
                  return news;
                });

                console.log('tempNews:', tempNews)
                setNews(tempNews);
                setCurStage(Constants.CurStage.DuringProcessing);
                setCheckRestart(false);
                setMatchCmd('');
                recognition.start();
              });
          } else if (transcriptCompare.includes('unicorn')) {
            console.log('unicorn')
            window.cornify_add();
            window.cornify_add();
            window.cornify_add();
            setCurStage(Constants.CurStage.BeforeTrigger);
            setCheckRestart(false);
            setMatchCmd('');
          } else if (transcriptCompare.includes('weather')) {
            setWeatherQuestion(matchCmd);
          } else if (Constants.REGEXWIKI.test(transcriptCompare)) {
            if (transcriptCompare.replace(Constants.REGEXWIKI, '').trim() !== '') {
              setCurStage(Constants.CurStage.DuringProcessing);
              setWiki(matchCmd);
            }
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
      <div className="jumbotron">
        <MyModal onClick={handleInitiateAudioClick} />
        <h1 className="display-4 text-center">Say "OK Jason"</h1>
        <div className={`text-center display-3 mb-2 ${curStage === Constants.CurStage.AfterTrigger || curStage === Constants.CurStage.AfterTriggerFirst ? "text-danger" : "text-dark"}`}>
          <i className="fas fa-microphone-alt"></i>
        </div>
        <p className="text-center">{matchCmd || '...'}</p>
      </div>
      <div className="container">
        {!news && !wiki && !weatherQuestion &&
          <Fragment>
            <h3 className="text-center">After that</h3>
            <h3 className="text-center font-weight-light">Say "What is the weather today?"</h3>
            <h3 className="text-center font-weight-light">Say "Tell me today's news."</h3>
            <h3 className="text-center font-weight-light">Say "Who is Adam Sandler."</h3>
            <h3 className="text-center font-weight-light">Say "Show me some unicorns."</h3>
          </Fragment>
        }
        {news && <News news={news} handleResumeSpeechRecognition={handleResumeSpeechRecognition}/>}
        {wiki && <Wiki wiki={wiki} handleResumeSpeechRecognition={handleResumeSpeechRecognition}/>}
        {weatherQuestion && <Weather question={weatherQuestion} handleResumeSpeechRecognition={handleResumeSpeechRecognition}/>}
      </div>
    </div>
  );
}

export default App;