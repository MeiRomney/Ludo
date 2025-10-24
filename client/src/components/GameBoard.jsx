import React from 'react'

const GameBoard = () => {

    // const blueSafeZone = [4, 5, 7, 10, 13, 16];
    // const greenSafeZone = [1, 4, 7, 10, 12, 13];
    // const redSafeZone = [1, 7, 8 , 9, 10, 11];
    // const yellowSafeZone = [6, 7, 8, 9, 10, 16];

    const blueSafeZone = [
        [1, 7],
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
        [2, 8],
    ];

  const redSafeZone = [
        [7, 1],
        [7, 2],
        [7, 3],
        [7, 4],
        [7, 5],
        [6, 1],
    ];

  const yellowSafeZone = [
        [7, 9],
        [7, 10],
        [7, 11],
        [7, 12],
        [7, 13],
        [8, 13],
    ];

  const greenSafeZone = [
        [9, 7],
        [10, 7],
        [11, 7],
        [12, 7],
        [13, 7],
        [13, 6],
    ];

    // helper function
    const match = (arr, row, col) => arr.some(([r, c]) => r === row && c === col);

    const getCellColor = (row, col) => {
        if(match(blueSafeZone, row, col)) return "bg-blue-500";
        if(match(greenSafeZone, row, col)) return "bg-green-500";
        if(match(redSafeZone, row, col)) return "bg-red-500";
        if(match(yellowSafeZone, row, col)) return "bg-yellow-500";
        return "bg-white";
    }

  return (
    <div className="flex-1 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-white rounded-2xl shadow-2xl grid grid-cols-15 grid-rows-15">

            {[...Array(225)].map((_, i) => {
                const row = Math.floor(i / 15);
                const col = i % 15;

                const bgColor = getCellColor(row, col);

                return (
                    <div
                    key={i}
                    className={`border border-gray-300 flex items-center justify-center ${bgColor}`}>

                    </div>
                );
            })}

        {/* Simplified Ludo board representation */}
            {/* Red zone - Top left */}
            <div className="col-span-6 row-span-6 bg-red-100 rounded-tl-xl border-4 border-red-400 flex items-center justify-center relative">
                <div className="absolute top-4 left-4 grid grid-cols-2 gap-2">
                    <div className="w-8 h-8 bg-[#FF4C4C] rounded-full shadow-md"></div>
                    <div className="w-8 h-8 bg-red-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-[#FF4C4C] rounded-full shadow-md"></div>
                    <div className="w-8 h-8 bg-[#FF4C4C] rounded-full shadow-md"></div>
                </div>
            </div>

            {/* Blue zone - Top right */}
            <div className="col-start-10 col-span-6 row-span-6 bg-blue-100 rounded-tr-xl border-4 border-blue-400 flex items-center justify-center relative">
                <div className="absolute top-4 right-4 grid grid-cols-2 gap-2">
                    <div className="w-8 h-8 bg-[#4C6FFF] rounded-full shadow-md"></div>
                    <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-[#4C6FFF] rounded-full shadow-md"></div>
                    <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
                </div>
            </div>

            {/* Green zone - Bottom left */}
            <div className="col-span-6 row-start-10 row-span-6 bg-green-100 rounded-bl-xl border-4 border-green-500 flex items-center justify-center relative">
                <div className="absolute bottom-4 left-4 grid grid-cols-2 gap-2">
                    <div className="w-8 h-8 bg-[#28A745] rounded-full shadow-md"></div>
                    <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-[#28A745] rounded-full shadow-md"></div>
                </div>
            </div>
            
            {/* Yellow zone - Bottom right */}
            <div className="col-start-10 col-span-6 row-start-10 row-span-6 bg-yellow-100 rounded-br-xl border-4 border-yellow-400 flex items-center justify-center relative">
                <div className="absolute bottom-4 right-4 grid grid-cols-2 gap-2">
                    <div className="w-8 h-8 bg-yellow-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-[#FFD93D] rounded-full shadow-md"></div>
                    <div className="w-8 h-8 bg-[#FFD93D] rounded-full shadow-md"></div>
                    <div className="w-8 h-8 bg-[#FFD93D] rounded-full shadow-md"></div>
                </div>
            </div>

            {/* Top middle path */}
            <div className="col-start-7 col-span-3 row-start-1 row-span-6 grid grid-cols-3 grid-rows-6 ">
                {[...Array(18)].map((_, i)=>(
                    <div
                    key={i}
                    className={`border border-gray-300 flex items-center justify-center ${
                        blueSafeZone.includes(i) ? 'bg-blue-500' : 'bg-white'}`}>
                        {/* Example highlight */}
                        {i === 13 && (<div className='w-6 h-6 bg-[#FFD93D] rounded-full shadow-md'></div>)}
                    </div>
                ))}
            </div>
        
            {/* Bottom middle path */}
            <div className="col-start-7 col-span-3 row-start-10 row-span-6 grid grid-cols-3 grid-rows-6">
                {[...Array(18)].map((_, i) => (
                    <div key={i} className={`border border-gray-300 flex items-center justify-center ${greenSafeZone.includes(i) ? 'bg-green-500' : 'bg-white'}`}>
                    {i === 2 && <div className="w-6 h-6 bg-[#FF4C4C] rounded-full shadow-md"></div>}
                    </div>
                ))}
            </div>
        
            {/* Left middle path */}
            <div className="col-span-6 row-start-7 row-span-3 grid grid-cols-6 grid-rows-3">
                {[...Array(18)].map((_, i) => (
                    <div key={i} className={`border border-gray-300 flex items-center justify-center ${redSafeZone.includes(i) ? 'bg-red-500' : 'bg-white'}`}>
                    {i === 2 && <div className="w-6 h-6 bg-[#28A745] rounded-full shadow-md"></div>}
                    </div>
                ))}
            </div>
        
            {/* Right middle path */}
            <div className="col-start-10 col-span-6 row-start-7 row-span-3 grid grid-cols-6 grid-rows-3">
                {[...Array(18)].map((_, i) => (
                    <div key={i} className={`border border-gray-300 flex items-center justify-center ${yellowSafeZone.includes(i) ? 'bg-yellow-500' : 'bg-white'}`}>
                    {i === 2 && <div className="w-6 h-6 bg-[#4C6FFF] rounded-full shadow-md"></div>}
                    </div>
                ))}
            </div>

            {/* Center */}
            <div className='col-start-7 col-span-3 row-start-7 row-span-3 grid grid-cols-3 grid-rows-3'>
                <div className='bg-red-500 col-span-3 row-span-1'></div>
                <div className='bg-white col-span-3 row-span-1 flex justify-center items-center'>
                    <div className='w-6 h-6 bg-gray-700 rounded-full'></div>
                </div>
                <div className='bg-green-500 col-span-3 row-span-1'></div>
            </div>
        </div>
    </div>
  )
}

export default GameBoard
