import React, { useRef, useState, useEffect }  from 'react'
import Speech from 'speak-tts';
import axios from 'axios';
import * as Constants from '../libs/constants';
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api"

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "500px"
}
const defaultCenter = {lat: -34, lng: 150};

function GoogleMaps({ question, handleResumeSpeechRecognition}) {
  const speech = useRef(new Speech());
  const [locationText, setLocationText] = useState('');
  const [center, setCenter] = useState({lat: -34, lng: 150});
  const [viewport, setViewport] = useState(null);
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });
  const [map, setMap] = useState(null);

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
          const {lat, lng} = data.results[0].geometry.location;
          const {viewport} = data.results[0].geometry;

          setViewport(new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(viewport.southwest.lat, viewport.southwest.lng),
            new window.google.maps.LatLng(viewport.northeast.lat, viewport.northeast.lng)
          ));
          console.log('lat, lng:', {lat, lng})
          setCenter({lat, lng});
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

  useEffect(() => {
    console.log('center changed:', center);
    map && map.setCenter(center);
  }, [center]);

  useEffect(() => {
    console.log('viewport changed:', viewport);
    map && viewport && map.fitBounds(viewport);
  }, [viewport]);

  return (
    <div>
      <h3>{locationText}</h3>
      {
        isLoaded &&
        <GoogleMap mapContainerStyle={mapContainerStyle} zoom={16} center={defaultCenter}
                    onLoad={map => {
                      console.log('map:', map);
                      console.log("onLoad")
                      setMap(map);
                    }}
                    onCenterChanged={() => {
                      // console.log('onCenterChanged()');
                      // map && viewport && map.fitBounds(viewport);
                    }}
                    onBoundsChanged={() => {
                      // console.log('onBoundsChanged()');
                    }}
        >
          <Marker position={center} />
        </GoogleMap>
      }
    </div>
  )
}

export default GoogleMaps
