import React from 'react'
import { Home, Pause, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';

const GamePlay = () => {

  const navigate = useNavigate();

  const pause = ()=> {
    console.log("pause");
  }

  const players = [
    { color: '#FF4C4C', name: 'Red', pieces: [1, 2, 3, 0] },
    { color: '#4C6FFF', name: 'Blue', pieces: [2, 1, 1, 0] },
    { color: '#FFD93D', name: 'Yellow', pieces: [0, 3, 1, 0] },
    { color: '#28A745', name: 'Green', pieces: [3, 0, 1, 0] },
  ];

  return (
    //<div className='flex flex-col items-center justify-center h-screen text-3xl'>GamePlay</div>
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
          {/* Navigation bar */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <img src="/Ludo.png" alt="Ludo" />
              </div>
              <span className="text-gray-800">Ludo Game</span>
            </div>
            <div className="flex gap-3">
              <button onClick={()=> navigate('/')} className="px-4 h-10 bg-blue-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
                <Home className="w-4 h-4" />
                Menu
              </button>
              <button onClick={()=> pause()} className="px-4 h-10 bg-amber-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
                <Pause className="w-4 h-4" />
                Pause
              </button>
              <button onClick={()=> navigate('/')} className="px-4 h-10 bg-red-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
                <X className="w-4 h-4" />
                Exit
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 flex gap-6 p-6">
            {/* Left sidebar - Player status */}
            <div className="w-64 flex flex-col gap-4">
              <PlayerCard color={players[0].color} name={players[0].name} pieces={players[0].pieces} active={true} />
              <div className="mt-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4">
                <div className="text-gray-600">Your Turn</div>
                <div className="w-20 h-20 bg-white border-4 border-gray-300 rounded-xl shadow-md flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  Roll Dice
                </button>
              </div>
              <PlayerCard color={players[1].color} name={players[1].name} pieces={players[1].pieces} active={false} />
              <div className="mt-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4">
                <div className="text-gray-600">Your Turn</div>
                <div className="w-20 h-20 bg-white border-4 border-gray-300 rounded-xl shadow-md flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  Roll Dice
                </button>
              </div>
            </div>
            
            {/* Center - Game board */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-[500px] h-[500px] bg-white rounded-2xl shadow-2xl grid grid-cols-15 grid-rows-15 gap-0 p-2">
                {/* Simplified Ludo board representation */}
                <div className="col-span-15 row-span-15 grid grid-cols-3 grid-rows-3 gap-1">
                  {/* Red zone - Top left */}
                  <div className="bg-red-100 rounded-tl-xl border-4 border-red-400 flex items-center justify-center relative">
                    <div className="absolute top-4 left-4 grid grid-cols-2 gap-2">
                      <div className="w-8 h-8 bg-[#FF4C4C] rounded-full shadow-md"></div>
                      <div className="w-8 h-8 bg-red-200 rounded-full"></div>
                      <div className="w-8 h-8 bg-[#FF4C4C] rounded-full shadow-md"></div>
                      <div className="w-8 h-8 bg-[#FF4C4C] rounded-full shadow-md"></div>
                    </div>
                  </div>
                  
                  {/* Top middle path */}
                  <div className="bg-white flex flex-col justify-around items-center">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-10 h-10 border-2 border-gray-300 rounded flex items-center justify-center">
                        {i === 1 && <div className="w-6 h-6 bg-[#FFD93D] rounded-full shadow-md"></div>}
                      </div>
                    ))}
                  </div>
                  
                  {/* Blue zone - Top right */}
                  <div className="bg-blue-100 rounded-tr-xl border-4 border-blue-400 flex items-center justify-center relative">
                    <div className="absolute top-4 right-4 grid grid-cols-2 gap-2">
                      <div className="w-8 h-8 bg-[#4C6FFF] rounded-full shadow-md"></div>
                      <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
                      <div className="w-8 h-8 bg-[#4C6FFF] rounded-full shadow-md"></div>
                      <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Left middle path */}
                  <div className="bg-white flex flex-row justify-around items-center">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-10 h-10 border-2 border-gray-300 rounded flex items-center justify-center">
                        {i === 1 && <div className="w-6 h-6 bg-[#28A745] rounded-full shadow-md"></div>}
                      </div>
                    ))}
                  </div>
                  
                  {/* Center */}
                  <div className="bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Right middle path */}
                  <div className="bg-white flex flex-row justify-around items-center">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-10 h-10 border-2 border-gray-300 rounded flex items-center justify-center">
                        {i === 0 && <div className="w-6 h-6 bg-[#4C6FFF] rounded-full shadow-md"></div>}
                      </div>
                    ))}
                  </div>
                  
                  {/* Green zone - Bottom left */}
                  <div className="bg-green-100 rounded-bl-xl border-4 border-green-500 flex items-center justify-center relative">
                    <div className="absolute bottom-4 left-4 grid grid-cols-2 gap-2">
                      <div className="w-8 h-8 bg-[#28A745] rounded-full shadow-md"></div>
                      <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                      <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                      <div className="w-8 h-8 bg-[#28A745] rounded-full shadow-md"></div>
                    </div>
                  </div>
                  
                  {/* Bottom middle path */}
                  <div className="bg-white flex flex-col justify-around items-center">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-10 h-10 border-2 border-gray-300 rounded flex items-center justify-center">
                        {i === 2 && <div className="w-6 h-6 bg-[#FF4C4C] rounded-full shadow-md"></div>}
                      </div>
                    ))}
                  </div>
                  
                  {/* Yellow zone - Bottom right */}
                  <div className="bg-yellow-100 rounded-br-xl border-4 border-yellow-400 flex items-center justify-center relative">
                    <div className="absolute bottom-4 right-4 grid grid-cols-2 gap-2">
                      <div className="w-8 h-8 bg-yellow-200 rounded-full"></div>
                      <div className="w-8 h-8 bg-[#FFD93D] rounded-full shadow-md"></div>
                      <div className="w-8 h-8 bg-[#FFD93D] rounded-full shadow-md"></div>
                      <div className="w-8 h-8 bg-[#FFD93D] rounded-full shadow-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right sidebar */}
            <div className="w-64 flex flex-col gap-4">
              <PlayerCard color={players[2].color} name={players[2].name} pieces={players[2].pieces} active={false} />
              <div className="mt-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4">
                <div className="text-gray-600">Your Turn</div>
                <div className="w-20 h-20 bg-white border-4 border-gray-300 rounded-xl shadow-md flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  Roll Dice
                </button>
              </div>
              <PlayerCard color={players[3].color} name={players[3].name} pieces={players[3].pieces} active={false} />
              
              {/* Dice section */}
              <div className="mt-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4">
                <div className="text-gray-600">Your Turn</div>
                <div className="w-20 h-20 bg-white border-4 border-gray-300 rounded-xl shadow-md flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  Roll Dice
                </button>
              </div>
            </div>
          </div>
        </div>
      );
}

export default GamePlay