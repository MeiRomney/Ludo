import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GamePlay from './pages/GamePlay'
import Results from './pages/Results'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/gameplay' element={<GamePlay />} />
        <Route path='/results' element={<Results />} />
      </Routes>
    </div>
  )
}

export default App