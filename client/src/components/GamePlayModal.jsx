import { X } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom'

const GamePlayModal = () => {

    const navigate = useNavigate();

    const startOnlineGame = async () => {
      await fetch('http://localhost:8080/api/game/start?email=mei.romney987@gmail.com', { method: 'POST' });
      navigate('/gameplay', { state: { mode: 'online' } });
    }

  return (
    <div className='absolute inset-0 z-50 flex w-1/3 h-3/4 justify-center text-center items-center m-auto rounded-xl bg-gray-300 bg-opacity-50'>
      <div className='relative p-10 rounded-xl w-[90%] h-[90%] flex flex-col bg-white shadow-lg'>
        <h2 className='text-2xl font-semibold mb-4'>Choose Game Mode</h2>
        <button onClick={()=> navigate('/')} className='absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer'><X/></button>
        <div className='flex flex-col p-10 gap-10 justify-center items-center text-center'>
            <button onClick={ startOnlineGame } className='w-full py-10 rounded-xl text-white font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-95 cursor-pointer'>
                Online
            </button>
            <button onClick={()=> navigate('/gameplay', { state: { mode: 'computer'}})} className='w-full py-10 rounded-xl text-white font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-95 cursor-pointer'>
                VS Computer
            </button>
        </div>
        
      </div>
    </div>
  )
}

export default GamePlayModal