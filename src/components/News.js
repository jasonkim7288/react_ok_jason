import React, { Fragment, useState, useEffect} from 'react';
import axios from 'axios';

function News({news: newsParam, handleResumeSpeechRecognition}) {
  const special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
  const decimal = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];
  const [news, setNews] = useState(null);

  const stringifyNumber = (n) => {
    if (n < 20) return special[n];
    if (n % 10 === 0) return decimal[Math.floor(n / 10) - 2] + 'ieth';
    return decimal[Math.floor(n / 10) -2] + 'y-' + special[n % 10];
  };

  useEffect(() => {
    axios.get(`https://newsapi.org/v2/top-headlines?country=au&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`)
    .then((res) => {
      // if content is null, take it out
      let tempNews = res.data.articles.reduce((acc, n) => {
        if (n.content) {
          n.content = n.content && n.content.replace(/… \[\+\d+ chars\]/, '');
          return [...acc, n];
        } else {
          return acc;
        }
      }, []);

      console.log('tempNews:', tempNews)
      setNews(tempNews);

      const textTTS = tempNews.map((n, i) => !n.content ? '' : `The ${stringifyNumber(i + 1)} news is ... ${n.content} ...`).join('');

      let msg = new SpeechSynthesisUtterance();
      msg.text = textTTS;

      speechSynthesis.speak(msg);
      msg.onstart = () => {
        console.log('TTS started');
      }
      msg.onend = () => {
        console.log('TTS finished');
        handleResumeSpeechRecognition();
      };
    });

  }, []);


  return (
    <Fragment>
      <button type="button" className="btn btn-warning btn-block mb-4" onClick={() => {
          speechSynthesis.cancel();
        }}>Stop Playing Audio</button>
      {
        news && news.map((n, i) =>
          <div className="card mb-4" key={`news_${i}`} data-aos={i % 2 === 0 ? "fade-right": "fade-left"}>
            <h3 className="card-header">{n.title}</h3>
            <div className="card-body">
              <div className="row">
                <img className="col-12 col-sm-5 col-md-3" src={n.urlToImage} alt="news iamge" />
                <div className="card-text col-12 col-sm-7 col-md-9">
                  <p>{n.content && n.content.replace(/(<([^>]+)>)/gi, "")}</p>
                  <p>Link : <a href={`${n.url}`} target="#blank">{` ${n.url}`}</a></p>
                </div>

              </div>
            </div>
          </div>
        )
      }
    </Fragment>
  )
}

export default News;
