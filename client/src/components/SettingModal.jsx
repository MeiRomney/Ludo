import React from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Setting = () => {

  const navigate = useNavigate();

  return (
    <div className='absolute inset-0 z-50 flex w-1/3 h-3/4 justify-center text-center items-center m-auto rounded-xl bg-gray-300 bg-opacity-50'>
      <div className='relative p-10 rounded-xl w-[90%] h-[90%] flex flex-col bg-white shadow-lg'>
        <h2 className='text-2xl font-semibold mb-4'>Settings</h2>
        <button onClick={()=> navigate('/')} className='absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer'><X/></button>
        <p>Hello</p>
      </div>
    </div>
  )
}

export default Setting