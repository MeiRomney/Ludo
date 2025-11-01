import React, { useEffect, useState } from 'react'
import { Home, Pause, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import Dice from '../components/Dice';
import GameBoard from '../components/GameBoard';

const GamePlay = () => {

  const navigate = useNavigate();
  const [game, setGame] = useState(null);

  useEffect(() => {
    // Fetch current game state from backend
    const fetchGame = async () => {
      const res = await fetch("http://localhost:8080/api/game/state");
      const data = await res.json();
      setGame(data);
    };
    fetchGame();

    // Auto refresh every 2 seconds
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, []);

  const pause = ()=> {
    console.log("pause");
  }

  // const players = [
  //   { color: '#FF4C4C', name: 'Red', pieces: [1, 2, 3, 0] },
  //   { color: '#28A745', name: 'Green', pieces: [3, 0, 1, 0] },
  //   { color: '#4C6FFF', name: 'Blue', pieces: [2, 1, 1, 0] },
  //   { color: '#FFD93D', name: 'Yellow', pieces: [0, 3, 1, 0] },
  // ];

  return (
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
              {/* <PlayerCard color={players[0].color} name={players[0].name} pieces={players[0].pieces} active={true} />
              <Dice name={players[0].name} />
              <PlayerCard color={players[1].color} name={players[1].name} pieces={players[1].pieces} active={false} />
              <Dice name={players[1].name} /> */}
              {game?.players?.[0] && (
                <PlayerCard
                  color={game.players[0].color}
                  name={game.players[0].name}
                  pieces={[0, 0, 0, 0]}
                  active={game.currentTurn === 0}
                />
              )}
              <Dice name={game?.players?.[0]?.name || "Player 1"}/>
            </div>
            
            {/* Center - Game board */}
            {game && <GameBoard players={game.players}/>}
            
            {/* Right sidebar */}
            <div className="w-64 flex flex-col gap-4">
              {/* <PlayerCard color={players[2].color} name={players[2].name} pieces={players[2].pieces} active={false} />
              <Dice name={players[2].name} />
              <PlayerCard color={players[3].color} name={players[3].name} pieces={players[3].pieces} active={false} />
              <Dice name={players[3].name} /> */}
              {game?.players?.slice(1).map((p, i) => (
                <React.Fragment key={p.playerId}>
                  <PlayerCard 
                    color={p.color}
                    name={p.name}
                    pieces={[0, 0, 0, 0]}
                    active={game.currentTurn === i + 1}
                  />
                  <Dice name={p.name}/>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      );
}

export default GamePlay