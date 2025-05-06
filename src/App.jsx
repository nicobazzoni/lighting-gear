import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GearList from './GearList'
import React from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <GearList/>
    
   </>
  )
}

export default App
