import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GamePlay from './pages/GamePlay'
import Results from './pages/Results'
import HowToPlayModal from './components/HowToPlayModal'
import Setting from './components/Setting'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage />}>
          <Route path='how-to-play' element={<HowToPlayModal />}/>
          <Route path='setting' element={<Setting />}/>
        </Route>
        <Route path='/gameplay' element={<GamePlay />} />
        <Route path='/results' element={<Results />} />
      </Routes>
    </div>
  )
}

export default App