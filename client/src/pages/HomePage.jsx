import React from 'react'
import LudoImg from '../assets/Ludo.png'

const HomePage = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen pb-40 bg-gradient-to-r from-purple-200 to-pink-200'>
      <div className='w-30 h-30'>
        <img src={LudoImg} alt="ludo" />
      </div>
      <h1 className='text-center text-3xl font-semibold'>Ludo RAY</h1>
      <p>Classic board game fun!</p>
      <button className='w-1/4 m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-95 transform cursor-pointer'>Start Game</button>
      <button className='w-1/4 m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 border-2 border-purple-500 hover:scale-95 hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:border-none hover:text-white transform cursor-pointer'>How to play</button>
      <button className='w-1/4 m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 border-2 border-purple-500 hover:scale-95 hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:border-none hover:text-white transform cursor-pointer'>Setting</button>
    </div>
  )
}

export default HomePage