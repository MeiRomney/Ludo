import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Setting = () => {

  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedType, setSelectedType] = useState('fourPlayers');

  const types = [
    { name: 'fourPlayers', label: '4 Players' },
    { name: 'twoPlayers', label: '2 Players' },
  ]
  const colors = [
    { name: 'Blue', value: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { name: 'Red', value: 'bg-red-500', hover: 'hover:bg-red-600' },
    { name: 'Green', value: 'bg-green-500', hover: 'hover:bg-green-600' },
    { name: 'Yellow', value: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  ]

  return (
    <div className='absolute inset-0 z-50 flex w-1/3 h-3/4 justify-center text-center items-center m-auto rounded-xl bg-gray-300 bg-opacity-50'>
      <div className='relative p-10 rounded-xl w-[90%] h-[90%] flex flex-col bg-white shadow-lg'>
        <h2 className='text-3xl font-bold text-gray-800 mb-4 text-center'>Settings</h2>
        <button onClick={()=> navigate('/')} className='absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer'><X/></button>
        <div className='flex flex-col items-center mt-8 space-y-8'>
          {/* Game Type */}
          <h3 className='text-lg font-medium text-gray-700 mb-2'>Select Game Type</h3>
          <div className='flex flex-col w-full space-y-3'>
            {types.map((type)=>(
              <button
                key={type.name}
                onClick={() => setSelectedType(type.name)}
                className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all duration-200 cursor-pointer
                  ${
                  selectedType === type.name
                    ? 'bg-blue-500 text-white scale-[1.02]'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Color selection */}
          <div className='w-full'>
            <h3 className='text-lg font-medium text-gray-700 mb-2'>Select Color</h3>
            <div className='flex justify-center gap-5'>
              {colors.map((color)=> (
                <button 
                key={color.name}
                onClick={()=> setSelectedColor(color.name)}
                className={`w-12 h-12 rounded-full border-4 transition-all duration-200 cursor-pointer ${color.value} ${color.hover}
                ${
                selectedColor === color.name
                ? 'scale-110 border-gray-800 shadow-lg'
                : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                title={color.name}/>
              ))}
            </div>
            <p className='mt-3 text-sm text-gray-600'>
              Selected Color: <span className='font-semibold'>{selectedColor}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Setting