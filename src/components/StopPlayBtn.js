import React, { Fragment } from 'react'

function StopPlayBtn() {
  return (
    <Fragment>
      <button type="button" className="btn btn-warning btn-block mb-4" onClick={() => {
          speechSynthesis.cancel();
      }}>Stop Playing Audio</button>
    </Fragment>
  )
}

export default StopPlayBtn
