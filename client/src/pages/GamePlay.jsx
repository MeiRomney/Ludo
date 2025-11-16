import React, { useEffect, useRef, useState } from 'react'
import { Home, Pause, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import Dice from '../components/Dice';
import GameBoard from '../components/GameBoard';
import toast, { Toaster } from 'react-hot-toast';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useUser } from '@clerk/clerk-react';

const API_BASE = "http://localhost:8080/api/game";

const GamePlay = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const gameId = state?.gameId;
  const initialPlayerId = state?.playerId ?? null;

  const [game, setGame] = useState(null);
  const [diceValue, setDiceValue] = useState(null);
  const [pendingRoll, setPendingRoll] = useState(null);
  const [pendingRollId, setPendingRollId] = useState(null);
  const [lastProcessedTurn, setLastProcessedTurn] = useState(null);
  const [paused, setPaused] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const stompClient = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    if(!gameId) {
      toast.error("No gameId provided");
      return;
    }

    // Create STOMP client backed by SockJS
    const stomp = new Client({
      // We use webSocketFactory to point to SockJS (server endpoint /ws assumed)
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      debug: () => {}, // silence debug in console
      onConnect: (frame) => {
        console.log("STOMP connected", frame);
        // subscribe to the topic for this game
        stomp.subscribe(`/topic/game/${gameId}`, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            setGame(payload);
            // Persist any server-provided playerId for this user (only if we can easily detect)
            tryDetectAndStorePlayerId(payload);

            // Update diceValue if it's your turn and the last dice roll is new
            // setTimeout(() => {
            //   if(playerId) {
            //     const lastRoll = payload.lastDiceRolls?.[playerId];
            //     if(payload.players[payload.currentTurn]?.playerId === playerId && lastRoll != null) {
            //       setDiceValue(lastRoll.value);
            //     }
            //   }
            // }, 50);
          } catch (err) {
            console.log("Failed to parse STOMP message", err);
          }
        });

        // fetch latest state immediately after connecting
        fetchGameState();
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onWebSocketClose: () => {
        console.log("WebSocket closed");
      },
    });

    stomp.activate();
    stompClient.current = stomp;

    return () => {
      try {
        stomp.deactivate();
      } catch (err) {
        console.error(err);
      }
      if(reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };

  }, [gameId]);

  useEffect(() => {
    if (!playerId || !game) return;

    const currentTurn = game.currentTurn;
    const currentPlayer = game.players[game.currentTurn];
    const myTurn = currentPlayer?.playerId === playerId;
    const lastRollObj = game.lastDiceRolls?.[playerId]; // { value, rollId }

    // If it's NOT your turn → clear local state
    if (!myTurn) {
      setPendingRoll(null);
      setPendingRollId(null);
      setDiceValue(null);
      setLastProcessedTurn(null);
      return;
    }

    // If you HAVE a new roll from server
    if (lastRollObj && lastProcessedTurn !== currentTurn /*&& lastRollObj.rollId !== pendingRollId*/) {
      setDiceValue(lastRollObj.value);
      setPendingRoll(lastRollObj.value);
      setPendingRollId(lastRollObj.rollId);
      setLastProcessedTurn(currentTurn)
    }

  }, [playerId, game?.currentTurn, game?.lastDiceRolls]);


  useEffect(() => {
    localStorage.removeItem("playerId");
  }, []);

  // useEffect(() => {
  //   if(!game || !playerId) return;

  //   const current = game.players[game.currentTurn];
  //   if(current?.playerId === playerId) {
  //     setDiceValue(null);
  //   }
  // }, [game?.currentTurn, playerId] );

  const fetchGameState = async () => {
    if(!gameId) return;
    try {
      const res = await fetch(`${API_BASE}/state?gameId=${encodeURIComponent(gameId)}`);
      if(!res.ok) {
        console.warn("Failed to fetch game state", await res.text());
        return;
      }
      const data = await res.json();
      setGame(data);
      tryDetectAndStorePlayerId(data);
    } catch (err) {
      console.log("Error fetching game state:", err);
    }
  }

  // Try to detect which player corresponds to the current client and store playerId in localStorage
  const tryDetectAndStorePlayerId = (gameState) => {
    if(!gameState || !gameState.players || playerId) return;

    // 1. If Initial playerId was provided, nothing to do
    // 2. Try to match by email if server includes it (server currently doesn't include email in Player)
    // 3. Try to match by Clerk User full name (best effort)
    // 4. If only one human player exists, assume it's this player

    // If state included playerId from navigation, keep it
    if(initialPlayerId) {
      setPlayerId(initialPlayerId);
      localStorage.setItem("playerId", initialPlayerId);
      return;
    }

    // heuristic: match by player name using Clerk User info
    const nameCandidates = [];
    if(user?.fullName) nameCandidates.push(user.fullName);
    if(user?.firstName) nameCandidates.push(user.firstName);
    if(user?.lastName) nameCandidates.push(user.lastName);

    // find non-bot players first
    const humans = gameState.players?.filter((p) => !p.isBot) ?? [];

    // 1. Exact name match
    for(const candidate of nameCandidates) {
      const found = humans.find((p) => p.name && p.name.toLowerCase() === candidate.toLowerCase());
      if(found) {
        setPlayerId(found.playerId);
        localStorage.setItem("playerId", found.playerId);
        return;
      }
    }

    // 2. partial name match (first name)
    if(user?.firstName) {
      const found = humans.find((p) => p.name && p.name.toLowerCase().includes(user.firstName.toLowerCase()));
      if(found) {
        setPlayerId(found.playerId);
        localStorage.setItem("playerId", found.playerId);
        return;
      }
    }

    // 3. Only one human, assume that's the player
    if(humans.length === 1) {
      setPlayerId(humans[0].playerId);
      localStorage.setItem("playerId", humans[0].playerId);
      return;
    }

    // Otherwise, leave unset; user should have been given their playerId by creation/join flow
  }
  useEffect(() => {
    if(!game) return;
    const finishedPlayers = game.players?.filter((p) => p.tokens?.every((t) => t.finished)) ?? [];
    const inPlayCount = (game.players?.length ?? 0) - finishedPlayers.length;
    if(game.players && inPlayCount <= 1) {
      localStorage.setItem("FinalGame", JSON.stringify(game));
      navigate("/results", { state: {gameId: game.gameId} });
    }
  }, [game, navigate]);

  // Player rolls dice, just store the result, don't move yet
  const handleDiceRoll = async () => {
    if(!isMyTurn()) {
      toast.error("It's not your turn");
      return;
    }

    if(pendingRoll !== null) return;
  
   await fetchGameState();
   // setDiceValue(null);
  };

  // When token clicked on board
  const handleTokenSelect = async ({ tokenId }) => {
    // Require diceValue present for this client (server enforces rules anyway)
    if(!pendingRoll) {
      toast.error("Please roll the dice first");
      return;
    }

    const steps = pendingRoll;

    // Ensure it's the player's turn
    const current = game.players?.[game.currentTurn];
    if(!current || current.playerId !== playerId) {
      toast.error("Not your turn!");
      return;
    }

    try {
      const url = `${API_BASE}/move?playerId=${encodeURIComponent(playerId)}&tokenId=${encodeURIComponent(tokenId)}&steps=${encodeURIComponent(steps)}`;
      const res = await fetch(url, { method: "POST" });

      if(!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Move failed");
      }

      // const payload = await res.json();
      // const updatedGame = payload?.game ?? payload;
      // if(updatedGame) {
      //   setGame(updatedGame); // Refresh board instantly
      // }
      const updatedGame = await res.json();
      setGame(updatedGame);

      setPendingRoll(null);
      setPendingRollId(null);
      setDiceValue(null); 
    } catch (err) {
      console.error("Error moving token: ", err);
      toast.error(err.message || "Move failed");
    }
  };

  const togglePause = async ()=> {
    if(!gameId) return;
    try {
      const action = paused ? "resume" : "pause";
      const res = await fetch(`${API_BASE}/${action}?gameId=${encodeURIComponent(gameId)}`, {
        method: "POST"
      });
      if(!res.ok){
        const txt = await res.text();
        throw new Error(txt || `${action} failed`);
      }
      setPaused(prev => !prev);
      if(paused) {
        toast.success("Game resumed");
      } else {
        toast.error("Game paused");
      }
    } catch (err) {
      console.error("Pause/resume error:", err);
      toast.error(err.message || "Pause/resume failed");
    }
  };

  const isMyTurn = () => {
    if(!game || !playerId) return false;
    const current = game.players?.[game.currentTurn];
    return current && current.playerId === playerId;
  }

  const getPlayerByColor = (color) => game?.players?.find((p) => p.color === color);

  // Initial load of state
  useEffect(() => {
    if(gameId) {
      fetchGameState();
    }
  }, [gameId]);

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
          <button onClick={()=> togglePause()} className="px-4 h-10 bg-amber-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
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
          {game ? ( 
            <GameBoard 
              players={game.players}
              currentPlayer={game.players[game.currentTurn]}
              onMove={(data) => handleTokenSelect(data)}
              selectable={diceValue != null && isMyTurn()} // allow selecting token if dice is rolled
              pendingRoll={diceValue}
            />
          ) : (
            <div>Loading game...</div>
          )}
        </div>

        {/* Player Positions */}
        {[
          { color: "red", pos: "top-5 left-5 items-start text-left" },
          { color: "blue", pos: "top-5 right-5 items-end text-right" },
          { color: "yellow", pos: "bottom-5 right-5 items-end text-right" },
          { color: "green", pos: "bottom-5 left-5 items-start text-left" },
        ].map((slot) => {
          const player = getPlayerByColor(slot.color);
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
                //diceRoll={diceValue}
                diceRoll={game?.lastDiceRolls?.[player.playerId] ?? null}
                onDiceRoll={
                  player.playerId === playerId && !player.isBot
                    ? handleDiceRoll
                    : undefined
                }
                disabled={!isActive || player.isBot || !isMyTurn() || game?.diceRolledThisTurn === true || pendingRoll !== null}
              />
              {isActive && !player.isBot && diceValue && isMyTurn() && (
                <div className='text-sm text-gray-600'>
                  Rolled: <b>{diceValue}</b> - Select a Token to move
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