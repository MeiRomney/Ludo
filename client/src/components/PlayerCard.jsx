import { Home, Star } from 'lucide-react';
import React from 'react'

const PlayerCard = ({ color, name, pieces, active }) => {
  return (
    <div className={`w-full bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3 border-2 transition-all max-sm:p-3 max-sm:gap-2 ${active ? 'border-purple-500 scale-[1.02] shadow-lg' : 'border-gray-100'} `}>
        {/* Header */}
        <div className='flex items-center justify-between max-sm:gap-2'>
            <div className='flex items-center gap-3 max-sm:gap-2'>
                <div className='w-6 h-6 rounded-full shadow-sm max-sm:w-5 max-sm:h-5' style={{backgroundColor: color}}></div>
                <span className='font-semibold text-gray-700 max-sm:text-sm'>{name}</span>
            </div>
            {active && (
                <div className='text-xs text-purple-600 font-medium animate-pulse max-sm:text-[10px]'>
                    Playing...
                </div>
            )}
        </div>

        {/* Pieces info */}
        <div className='flex flex-wrap gap-2 max-sm:gap-1'>
            {/* {pieces.map((t, i)=> (
                <div key={i} className='flex items-center justify-center w-10 h-10 bg-gray-50 border rounded-lg'>
                    <div className='w-6 h-6 rounded-full shadow-sm' style={{backgroundColor: color}}></div>
                </div>
            ))} */}
            {pieces.map((t, i) => {
                const { position, finished } = t;

                let bg = "bg-gray-50 border-gray-300";
                let icon = null;
                let innerColor = color;

                if(finished) {
                    bg = "bg-yellow-50 border-yellow-400";
                    icon = <Star size={16} className='text-yellow-600 max-sm:w-4 max-sm:h-4'/>;
                } else if(position === -1) {
                    bg = "bg-gray-100 border-gray-300";
                    icon = <Home size={16} className='text-gray-500 max-sm:w-4 max-sm:h-4'/>;
                } else if(position >= 51) {
                    bg = "bg-amber-50 border-amber-400";
                }

                return (
                    <div
                        key={i}
                        className={`flex items-center justify-center w-10 h-10 border rounded-lg ${bg} max-sm:w-8 max-sm:h-8`}
                    >
                        {icon ? (
                            icon
                        ) : (
                            <div
                                className='w-6 h-6 rounded-full shadow-sm max-sm:w-5 max-sm:h-5'
                                style={{ backgroundColor: innerColor }}
                            ></div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Stats */}
        <div className='flex justify-between text-xs text-gray-500 max-sm:text-[10px]'>
            <span>Active</span>
            <span className='font-semibold text-gray-700'>
                {pieces.filter((t) => t.position > -1 && !t.finished).length}
            </span>
        </div>
    </div>
  )
}

export default PlayerCard