import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Overlay from './Overlay.jsx'
import Annotate from './Annotate.jsx'
import './index.css'

const hash = window.location.hash

ReactDOM.createRoot(document.getElementById('root')).render(
  hash === '#overlay' ? <Overlay /> :
  hash === '#annotate' ? <Annotate /> :
  <App />
)