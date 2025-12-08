import { X } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom'

const HowToPlayModal = () => {

  const navigate = useNavigate();

  return (
    <div className='absolute inset-0 z-50 flex w-1/3 h-3/4 justify-center text-center items-center m-auto rounded-xl bg-gray-300 bg-opacity-50 max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:p-4'>
      <div className='relative p-10 rounded-xl w-[90%] h-[90%] flex flex-col bg-white shadow-lg max-sm:w-full max-sm:h-full max-sm:p-5 max-sm:rounded-lg'>
        <h2 className='text-3xl font-bold text-gray-800 mb-4 text-center max-sm:text-2xl'>How To Play</h2>
        <button onClick={()=> navigate('/')} className='absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer max-sm:w-5 max-sm:h-5'><X/></button>
        
        <div className='overflow-y-auto pr-2 max-sm:text-sm' >
          <h3 className='text-xl font-semibold text-blue-600 mb-3 text-left max-sm:text-lg'>Basic Rules</h3>
          <ul className='list-disc list-inside text-gray-700 space-y-2 text-left'>
            <li>Each player has 4 pieces starting at home</li>
            <li>Roll a 6 to bring a piece out of home</li>
            <li>Move pieces clockwise around the board</li>
            <li>Get all 4 pieces to the center to win</li>
          </ul>
        </div>

        {/* Divider */}
        <div className='border-t border-gray-200 my-4'></div>
        
        <div>
          <h3 className='text-xl font-semibold text-green-600 mb-3 text-left max-sm:text-lg'>Special Rules</h3>
          <ul className='list-disc list-inside text-gray-700 space-y-2 text-left'>
            <li>Rolling a 6 gives you another turn</li>
            <li>Landing on an opponent's piece sends it home</li>
            <li>Safe squares (colored) protect your pieces</li>
            <li>Must roll exact number to reach center</li>
          </ul>
        </div>
        
      </div>
    </div>
  )
}

export default HowToPlayModal