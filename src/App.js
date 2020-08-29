import React, { useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';
import News from './components/News';
import MyModal from './components/MyModal';
import Wiki from './components/Wiki';
import * as Constants from './libs/constants'

function App() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  const speechOnAudio = new Audio(process.env.PUBLIC_URL + '/SpeechOn.wav');
  // const speechEndAudio = new Audio(process.env.PUBLIC_URL + '/SpeechEnd.wav');

  const [command, setCommand] = useState('beforeTrigger');
  const [checkRestart, setCheckRestart] = useState(false);
  const [matchCmd, setMatchCmd] = useState('');
  const [news, setNews] = useState([]);
  const [wiki, setWiki] = useState('');

  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.addEventListener('result', e => {
    const transcript = [...e.results].map(result => result[0].transcript).join('');

    if(e.results[0].isFinal) {
      setMatchCmd(transcript)
    }
  });

  speechOnAudio.onended = () => {
    console.log("speechOnAudio onEnded");
    recognition.start();
  }


  const handleInitiateAudioClick = () => {
    console.log('handleInitiateAudioClick');

    setCommand('readyToCommand');
    setMatchCmd('explain about dog');
    return;

    speechOnAudio.play().then(() => {
      speechOnAudio.pause();
      recognition.start();
    });
  }

  recognition.addEventListener('end', () => {
    console.log("Speech recognition ended");
    setCheckRestart(true);
  });

  useEffect(() => {
    const handleCommand = () => {
      switch (command) {
        case 'beforeTrigger':
          console.log('beforeTrigger is set')
          break;
        case 'readyToCommand':
          console.log('readyToCommand is set')
          break;
        default:
          break;
      }
    }
    handleCommand();
  }, [command]);

  useEffect(() => {
    const handleCheckRestart = () => {
      console.log(`handleCheckRestart, checkRestart = ${checkRestart}, command = ${command}`);
      if(checkRestart) {
        if(command === 'beforeTrigger') {
          recognition.start();
          console.log("Speech recognition restart");
          setCheckRestart(false);
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

      console.log(`handleMatchCmd, command = ${command}`);
      const transcriptCompare = matchCmd.toLowerCase();
      console.log('transcriptCompare:', transcriptCompare)

      switch(command) {
        case 'beforeTrigger':
          if (transcriptCompare === 'ok jason') {
            speechOnAudio.play();
            setNews([]);
            setCommand('readyToCommand');
            setMatchCmd('');
            setWiki('');
          }
          break;
        case 'readyToCommand':
          if (transcriptCompare.includes('news')) {
            axios.get(`http://newsapi.org/v2/top-headlines?country=au&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`)
              .then((res) => {
                let tempNews = res.data.articles.map(news => {
                  news.content = news.content && news.content.replace(/… \[\+\d+ chars\]/, '');
                  return news;
                });

                console.log('tempNews:', tempNews)
                setNews(tempNews);
                setCommand('beforeTrigger');
                setCheckRestart(false);
                setMatchCmd('');
                recognition.start();
              });
          } else if (transcriptCompare.includes('unicorn')) {
            console.log('unicorn')
            window.cornify_add();
            window.cornify_add();
            window.cornify_add();
            setCommand('beforeTrigger');
            setCheckRestart(false);
            setMatchCmd('');
          } else if (Constants.REGEXWIKI.test(transcriptCompare)) {
            if (transcriptCompare.replace(Constants.REGEXWIKI, '').trim() !== '') {
              setWiki(matchCmd);
            }
            setCommand('beforeTrigger');
            setCheckRestart(false);
            setMatchCmd('');
          } else {
            setCommand('beforeTrigger');
            setCheckRestart(false);
            setMatchCmd('');
          }
          break;
        default:
          break;
      }
    };
    handleMatchCmd();
  }, [matchCmd]);

  useEffect(() => {
    // console.log(window);
    window.AOS.init({
      duration: 1500,
      offset: 200
    });
  }, []);

  return (
    <div>
      <div className="jumbotron">
        <MyModal onClick={handleInitiateAudioClick} />
        <h1 className="display-4 text-center">Say "OK Jason"</h1>
        <div className={`text-center display-3 mb-2 ${command === 'readyToCommand' ? "text-danger" : "text-dark"}`}>
          <i className="fas fa-microphone-alt"></i>
        </div>
        <p className="text-center">{matchCmd || '...'}</p>
      </div>
      <div className="container">
        {news && news.length !== 0 && <News news={news}/>}
        {wiki && <Wiki wiki={wiki}/>}
      </div>
    </div>
  );
}

export default App;