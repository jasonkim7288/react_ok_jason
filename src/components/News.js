import React, { Fragment, useEffect, useRef} from 'react'
import Speech from 'speak-tts';

function News(props) {
  const special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
  const decimal = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];
  const speech = useRef(new Speech());
  // if content is null, just chuck it away
  const news = [...props.news].reduce((acc, element) => element.content ? [...acc, element] : acc, []);

  const stringifyNumber = (n) => {
    if (n < 20) return special[n];
    if (n % 10 === 0) return decimal[Math.floor(n / 10) - 2] + 'ieth';
    return decimal[Math.floor(n / 10) -2] + 'y-' + special[n % 10];
  };

  useEffect(() => {
    const curSpeech = speech.current;
    curSpeech.init({
      voice:'Google UK English Male'
    }).then(data => {
      const text = news.map((n, i) => !n.content ? '' : `The ${stringifyNumber(i + 1)} news is ... ${n.content} ...`).join('');

      console.log("how many times")
      curSpeech.speak({
        text: text
      });
    });

    return () => {
      curSpeech.cancel();
    }

  }, []);


  return (
    <Fragment>
      <button type="button" className="btn btn-warning btn-block mb-4" onClick={() => {
          if(speech) {
            console.log('Speech canceled');
            speech.current.cancel();
          }
        }}>Stop Playing Audio</button>
      {
        news.map((n, i) =>
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
