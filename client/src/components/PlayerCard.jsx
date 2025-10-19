import React from 'react'

const PlayerCard = ({ color, name, pieces, active }) => {
  return (
    <div className={`w-full bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3 border-2 transition-all ${active ? 'border-purple-500 scale-[1.02] shadow-lg' : 'border-gray-100'} `}>
        {/* Header */}
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <div className='w-6 h-6 rounded-full shadow-sm' style={{backgroundColor: color}}></div>
                <span className='font-semibold text-gray-700'>{name}</span>
            </div>
            {active && (
                <div className='text-xs text-purple-600 font-medium animate-pulse'>
                    Playing...
                </div>
            )}
        </div>

        {/* Pieces info */}
        <div className='flex flex-wrap gap-2'>
            {pieces.map((p, i)=> (
                <div key={i} className='flex items-center justify-center w-10 h-10 bg-gray-50 border rounded-lg'>
                    <div className='w-6 h-6 rounded-full shadow-sm' style={{backgroundColor: color}}></div>
                </div>
            ))}
        </div>

        {/* Stats */}
        <div className='flex justify-between text-xs text-gray-500'>
            <span>Total Pieces</span>
            <span className='font-semibold text-gray-700'>{pieces.length}</span>
        </div>
    </div>
  )
}

export default PlayerCard