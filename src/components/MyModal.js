import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap';

function MyModal(props) {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    props.onClick();
    setShow(false);
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Please confirm the audio permission</Modal.Title>
      </Modal.Header>
      <Modal.Body>This speech recognition app needs the audio permission. Please select OK button.</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>OK</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default MyModal;