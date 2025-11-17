import React, { useEffect, useRef, useState } from 'react';
import { Home, Pause, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import Dice from '../components/Dice';
import GameBoard from '../components/GameBoard';
import toast, { Toaster } from 'react-hot-toast';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const API_BASE = "http://localhost:8080/api/game";

const GamePlay = () => {

  const navigate = useNavigate();
  const { state } = useLocation();

  const gameId = state?.gameId;
  const [playerId, setPlayerId] = useState(state?.playerId ?? localStorage.getItem("playerId") ?? null);

  const [game, setGame] = useState(null);
  const [pendingRoll, setPendingRoll] = useState(null);
  const [roller, setRoller] = useState(null);
  const [paused, setPaused] = useState(false);

  const stompClient = useRef(null);

  // ---------------------------
  // WebSocket Setup
  // ---------------------------
  useEffect(() => {
    if (!gameId) return;

    const stomp = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        stomp.subscribe(`/topic/game/${gameId}`, (msg) => {
          try {
            const updated = JSON.parse(msg.body);

            if(!updated) {
              localStorage.removeItem("FinalGame");
              toast("Game ended", { icon: "🛑" });
              navigate("/");
              return;
            }

            setGame(updated);
          } catch (err) {
            console.error("WS parse error", err);
          }
        });

        fetchGameState();
      }
    });

    stomp.activate();
    stompClient.current = stomp;

    return () => {
      try { stomp.deactivate(); } catch { /* empty */ }
    };
  }, [gameId]);

  useEffect(() => {
    if(paused) return;

    const checkGameOver = async () => {
      try {
        const res = await fetch(`${API_BASE}/state?gameId=${gameId}`);
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

  // ---------------------------
  // Fetch Game State (used on actions)
  // ---------------------------
  const fetchGameState = async () => {
    try {
      const res = await fetch(`${API_BASE}/state?gameId=${encodeURIComponent(gameId)}`);
      if (!res.ok) return;

      const data = await res.json();
      setGame(data);

      // AUTO NAVIGATE ON GAME OVER
      // const finishedPlayers = data.players.filter(p => p.tokens.every(t => t.finished));
      // if (finishedPlayers.length >= data.players.length - 1) {
      //   toast.success("🏁 Game Over!");
      //   localStorage.setItem("FinalGame", JSON.stringify(data));
      //   navigate("/results", { state: { gameId } });
      // }
    } catch (err) {
      console.error("fetchGameState() error:", err);
    }
  };

  // ---------------------------
  // Pause / Resume
  // ---------------------------
  const togglePause = async () => {
    try {
      const action = paused ? "resume" : "pause";
      const res = await fetch(`${API_BASE}/${action}?gameId=${gameId}`, { method: "POST" });

      if (res.ok) {
        setPaused(prev => !prev);
        toast[paused ? "success" : "warning"](`Game ${paused ? "resumed" : "paused"}`);
      }
    } catch (err) {
      toast.error("Game paused");
      console.log(err);
    }
  };

  const isMyTurn = () => {
    if (!game || !playerId) return false;
    const current = game.players?.[game.currentTurn];
    return current?.playerId === playerId;
  };

  // ---------------------------
  // Dice Roll Logic
  // ---------------------------
  const handleDiceRoll = async (player, dice) => {
    if (paused) return toast.error("Game is paused!");

    setPendingRoll(dice);
    setRoller(player);

    //await fetchGameState();
  };

  // ---------------------------
  // Move Token Logic
  // ---------------------------
  const handleTokenSelect = async ({ playerColor, tokenId }) => {
    if (paused) return toast.error("Game is paused!");

    if (!game || !pendingRoll)
      return toast.error("Roll the dice first!");

    const player = game.players.find(p => p.color === playerColor);

    if (!player || player.playerId !== roller?.playerId)
      return toast.error("Not your turn!");

    try {
      const res = await fetch(
        `${API_BASE}/move?playerId=${player.playerId}&tokenId=${tokenId}&steps=${pendingRoll}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const msg = await res.text();
        return toast.error(msg || "Move failed");
      }

      // const updated = await res.json();
      // setGame(updated);

      // RESET dice after move
      setPendingRoll(null);
      setRoller(null);

      // Pull fresh state (important!)
      //await fetchGameState();

    } catch (err) {
      console.error("Move error:", err);
      toast.error("Move failed");
    }
  };

  const handleExitGame = async () => {
    if(!gameId) return navigate("/");

    try {
      await fetch(`${API_BASE}/end?gameId=${gameId}`, { method: "POST" });
    } catch(err) {
      console.log("Failed to end game", err)
    }

    navigate("/");
  };

  // ---------------------------
  // UI Rendering
  // ---------------------------
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Toaster position='top-center' />

      {/* NAV BAR */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <img src="/Ludo.png" alt="Ludo" />
          </div>
          <span className="text-gray-800">Ludo Game</span>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExitGame} className="px-4 h-10 bg-blue-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"> <Home size={18}/> Menu </button>
          <button onClick={togglePause} className="px-4 h-10 bg-amber-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <Pause size={18}/> {paused ? "Resume" : "Pause"}
          </button>
          <button onClick={handleExitGame} className="px-4 h-10 bg-red-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"> <X size={18}/> Exit </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 flex justify-center items-center p-6">

        {paused && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-2xl font-bold">
            Game Paused
          </div>
        )}

        {/* BOARD */}
        <div className="w-[500px] h-[500px] flex items-center justify-center">
          {game?.players?.length ? (
            <GameBoard
              players={game.players}
              currentPlayer={ 
                game?.players && Number.isInteger(game.currentTurn)
                ? game.players[game.currentTurn]
                : null
              }
              onMove={handleTokenSelect}
              selectable={!!pendingRoll}
              pendingRoll={pendingRoll}
            />
          ) : (
            <div>Loading...</div>
          )}
        </div>

        {/* PLAYER HUDS */}
        {["red", "blue", "yellow", "green"].map(color => {
          const player = game?.players?.find(p => p.color === color);
          if (!player) return null;

          const isActive = game.currentTurn === game.players.findIndex(p => p.color === color);

          const positions = {
            red: "top-5 left-5 items-start",
            blue: "top-5 right-5 items-end",
            yellow: "bottom-5 right-5 items-end",
            green: "bottom-5 left-5 items-start"
          };

          return (
            <div key={player.playerId} className={`absolute ${positions[color]} flex flex-col gap-2`}>
              <PlayerCard color={player.color} name={player.name} pieces={player.tokens} active={isActive} />

              <Dice
                name={player.name}
                player={player}
                diceRoll={game?.lastDiceRolls?.[player.playerId]}
                onDiceRoll={player.isBot ? undefined : (dice) => handleDiceRoll(player, dice)}
                disabled={!isActive || player.isBot || !isMyTurn() || game?.diceRolledThisTurn}
              />

              {isActive && !player.isBot && pendingRoll && roller?.playerId === player.playerId && (
                <div className="text-sm text-gray-600">
                  Rolled: <b>{pendingRoll}</b> — choose a token
                </div>
              )}
            </div>
          );
        })}

      </div>

    </div>
  );
};

export default GamePlay;
