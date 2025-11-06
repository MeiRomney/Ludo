import React, { useEffect, useState } from 'react'
import { Home, Pause, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import Dice from '../components/Dice';
import GameBoard from '../components/GameBoard';

const GamePlay = () => {

  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [pendingRoll, setPendingRoll] = useState(null); // Stores rolled number waiting for move
  const [roller, setRoller] = useState(null); // which player rolled last
  const [token, setSelectedToken] = useState(null);

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

  // Player rolls dice, just store the result, don't move yet
  const handleDiceRoll = async(player, value) => {
    if(!player || value == null) return;
    console.log(`🎲 ${player.name} rolled ${value}`);
    setPendingRoll(value);
    setRoller(player); 
  };

  // When token clicked on board
  const handleTokenSelect = async ({playerColor, tokenId}) => {
    if(!game || !pendingRoll) {
      alert("Please roll the dice first!");
      return;
    }

    const player = game.players.find((p) => p.color === playerColor);
    if(!player || player.playerId !== roller?.playerId) {
      alert("Not your turn!");
      return;
    }

    try {
      const moveRes = await fetch(
        `http://localhost:8080/api/game/move?playerId=${player.playerId}&tokenId=${tokenId}&steps=${pendingRoll}`,
        { method: "POST" }
      );

      if(!moveRes.ok) {
        console.error("Failed to move token");
        return;
      }

      const updatedGame = await moveRes.json();
      setGame(updatedGame); // Refresh board instantly
      setPendingRoll(null);
      setRoller(null);
      setSelectedToken(null);
    } catch (err) {
      console.error("Error moving token: ", err);
    }
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
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
      <div className="relative flex-1 flex justify-center items-center p-6">
        {/* Center Game Board */}
        <div className="w-[500px] h-[500px] flex items-center justify-center">
          {game && <GameBoard 
          players={game.players}
          currentPlayer={game.players[game.currentTurn]}
          onMove={(data) => handleTokenSelect(data)}
          selectable={!!pendingRoll} // allow selecting token if dice is rolled
          pendingRoll={pendingRoll}
          />}
        </div>

        {/* Player Positions */}
        {[
          { color: "red", pos: "top-5 left-5 items-start text-left" },
          { color: "blue", pos: "top-5 right-5 items-end text-right" },
          { color: "yellow", pos: "bottom-5 right-5 items-end text-right" },
          { color: "green", pos: "bottom-5 left-5 items-start text-left" },
        ].map((slot) => {
          const player = game?.players?.find((p) => p.color === slot.color);
          if (!player) return null;

          const isActive = game.currentTurn === game.players.findIndex((p) => p.color === slot.color);

          return (
            <div
              key={player.playerId}
              className={`absolute ${slot.pos} flex flex-col gap-2 max-w-[180px] sm:max-w-[220px]`}
            >
              <PlayerCard
                color={player.color}
                name={player.name}
                pieces={player.tokens}
                active={isActive}
              />
              <Dice
                name={player.name}
                player={player}
                onDiceRoll={(value) => handleDiceRoll(player, value)}
              />
              {isActive && pendingRoll && roller?.playerId === player.playerId && (
                <div className='text-sm text-gray-600'>
                  Rolled: <b>{pendingRoll}</b> - Select a Token to move
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GamePlay