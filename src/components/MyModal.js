import React, { useState, useRef } from 'react'
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

function MyModal({handleInitiateAudioClick, setTriggerWord}) {
  const [show, setShow] = useState(true);
  const inputKeyword = useRef(null);

  const handleClose = () => {
    const tempTriggerWord = inputKeyword.current.value.trim() || "OK Jason";

    setTriggerWord(tempTriggerWord);
    if (tempTriggerWord.toLowerCase() !== "ok jason") {
      axios.get(`https://gender-api.com/get?name=${tempTriggerWord}&key=${process.env.REACT_APP_GENDER_API_KEY}`)
        .then(res => {
          console.log('res:', res);
          handleInitiateAudioClick(res.data.gender);
        })
        .catch(err => {
          console.log('err:', err);
          handleInitiateAudioClick();
        })
        .then(res => {
          setShow(false);
        })
    } else {
      handleInitiateAudioClick();
      setShow(false);
    }
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Welcome to OK Jason</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please confirm your triggering keyword</p>
        <Form.Control ref={inputKeyword} type="text" placeholder="OK Jason" />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-block" variant="primary" onClick={handleClose}>OK</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default MyModal;