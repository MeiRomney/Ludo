import React, { useEffect, useState } from 'react'
import { Home, Pause, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import Dice from '../components/Dice';
import GameBoard from '../components/GameBoard';
import toast, { Toaster } from 'react-hot-toast';

const GamePlay = () => {

  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [pendingRoll, setPendingRoll] = useState(null); // Stores rolled number waiting for move
  const [roller, setRoller] = useState(null); // which player rolled last
  const [token, setSelectedToken] = useState(null);
  const [paused, setPaused] = useState(false);
  const [rollCount, setRollCount] = useState(0);

  useEffect(() => {
    if(paused) return;
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
  }, [paused]);

  const fetchGameState = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/game/state");
      if(!res.ok) return;
      const data = await res.json();

      if (game) {
      for (let playerId in data.lastDiceRolls) {
        const lastRoll = game.lastDiceRolls?.[playerId]?.rollId;
        const newRoll = data.lastDiceRolls[playerId].rollId;
        if (lastRoll !== newRoll) {
          setRollCount(prev => prev + 1);
        }
      }
    }

      setGame(data);

      // Check for game over immediately
      const finishedPlayers = data.players.filter(p => p.tokens.every(t => t.finished));
      if(finishedPlayers.length >= data.players.length - 1) {
        toast.success("🏁 Game Over!");
        console.log("🏁 Game Over! Navigating to results...");
        localStorage.setItem("FinalGame", JSON.stringify(data));
        navigate("/results");
      }
    } catch (err) {
      console.log("Error fetching game state:", err);
    }
  }

  useEffect(() => {
    if(paused) return;

    const checkGameOver = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/game/state");
        if(!res.ok) return;

        const gameState = await res.json();
        if(!gameState || !gameState.players) return;

        // Count how many players have finished all four tokens
        const finishedPlayers = gameState.players.filter(
          p => p.tokens.every(t => t.finished)
        );

        if(finishedPlayers.length >= gameState.players.length - 1) {
          console.log("🏁 Game Over! Navigating to results...");
          localStorage.setItem("FinalGame", JSON.stringify(gameState));
          navigate("/results");
        }
      } catch (err) {
        console.error("Error checking winner:", err);
      }
    };

    // Check every 2 seconds
    const interval = setInterval(checkGameOver, 2000);
    return () => clearInterval(interval);
  }, [navigate, paused]);

  const pause = async ()=> {
    try {
      const res = await fetch(`http://localhost:8080/api/game/${paused ? 'resume' : 'pause'}`, {
        method: "POST"
      });
      if(res.ok){
        setPaused(prev => !prev);
        toast[paused ? "success" : "warning"](`Game ${paused ? 'resumed' : 'paused'}`);
      }
      
    } catch (err) {
      toast.error("Game paused", err);
    }
    
  }

  // Player rolls dice, just store the result, don't move yet
  const handleDiceRoll = async(player, dice) => {
    if(paused) {
      toast.error("Game is paused!");
      return;
    }

    if(!player || !dice) return;
    console.log(`🎲 ${player.name} rolled ${dice.value} (rollId: ${dice.rollId})`);
    setPendingRoll(dice.value);
    setRoller(player);
    setRollCount(prev => prev + 1);

    await fetchGameState();
  };

  // When token clicked on board
  const handleTokenSelect = async ({playerColor, tokenId}) => {
    if(paused) {
      toast.error("Game is paused!");
      return;
    }

    if(!game || !pendingRoll) {
      toast.error("Please roll the dice first!");
      return;
    }

    const player = game.players.find((p) => p.color === playerColor);
    if(!player || player.playerId !== roller?.playerId) {
      toast.error("Not your turn!");
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
      <Toaster position='top-center'/>
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
            {paused ? "Resume" : "Pause"}
          </button>
          <button onClick={()=> navigate('/')} className="px-4 h-10 bg-red-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <X className="w-4 h-4" />
            Exit
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative flex-1 flex justify-center items-center p-6">
        {paused && (
          <div className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-2xl font-bold'>
            Game Paused
          </div>
        )}
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
                diceRoll={game?.lastDiceRolls?.[player.playerId] ?? null}
                onDiceRoll={player.isBot ? undefined : (dice) => handleDiceRoll(player, dice)}
              />
              {isActive && !player.isBot && pendingRoll && roller?.playerId === player.playerId && (
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