import React from 'react'

const Dice = ({name}) => {
  return (
    <div className="mt-auto bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center gap-0">
        <div className="text-gray-600 mb-2">{name}'s Turn</div>
        <div className="w-20 h-20 bg-white border-4 border-gray-300 rounded-xl shadow-md flex items-center justify-center cursor-pointer">
            <div className="grid grid-cols-2 gap-2 p-2">
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            </div>
        </div>
    </div>
  )
}

export default Dice