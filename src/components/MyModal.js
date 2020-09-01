import React, { useState, useRef } from 'react'
import { Modal, Button, Form } from 'react-bootstrap';

function MyModal({onClick, setTriggerWord}) {
  const [show, setShow] = useState(true);
  const inputKeyword = useRef(null);

  const handleClose = () => {
    setTriggerWord(inputKeyword.current.value || "OK Jason");
    onClick();
    setShow(false);
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Welcome to OK Json</Modal.Title>
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