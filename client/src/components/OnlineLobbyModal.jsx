import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// const API_BASE = "http://localhost:8080/";
const API_BASE = import.meta.env.VITE_API_BASE;

const OnlineLobbyModal = ({ onClose }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [gameIdInput, setGameIdInput] = useState('');
  const [waitingGames, setWaitingGames] = useState([]);
  const hostName = user?.firstName || 'Host';

  // Fetch waiting games on mount
  useEffect(() => {
    fetchWaitingGames();
    const interval = setInterval(fetchWaitingGames, 3000); // Refresh every 3s
    return () => clearInterval(interval);
  }, []);

  const fetchWaitingGames = async () => {
    try {
      const res = await fetch(`${API_BASE}api/game/waiting`);
      const data = await res.json();
      setWaitingGames(data);
    } catch (err) {
      console.error(err);
    }
  };

  const createGame = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      const res = await fetch(`${API_BASE}api/game/create?email=${encodeURIComponent(email)}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create game');
      const data = await res.json();

      // Wait until host rolls dice to start
      navigate('/gameplay', {
        state: {
          mode: 'online',
          gameId: data.gameId,
          playerId: data.game.players.find(p => !p.bot).playerId,
          isHost: true // optional flag
        },
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create game');
    }
  };

  const joinGame = async (idFromList) => {
    const gameId = idFromList || gameIdInput;
    if (!gameId) return toast.error('Please enter a Game ID');
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      const res = await fetch(`${API_BASE}api/game/join?email=${encodeURIComponent(email)}&gameId=${gameId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to join game');
      const data = await res.json();

      navigate('/gameplay', {
        state: {
          mode: 'online',
          gameId: data.game.gameId,
          playerId: data.game.players.find(p => !p.bot).playerId,
          isHost: false
        },
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to join game');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-center items-center bg-gray-300 bg-opacity-50 max-sm:p-2">
      <Toaster position="top-center" />
      <div className="relative w-full h-full max-w-2xl max-h-[600px] bg-white rounded-xl shadow-lg p-10 flex flex-col overflow-y-auto max-sm:p-5 max-sm:max-h-[90%] max-sm:rounded-lg">
        <button onClick={onClose} className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer max-sm:w-5 max-sm:h-5">
          <X />
        </button>

        <h2 className="text-2xl font-semibold mb-4 max-sm:text-xl">Online Lobby</h2>
        <p className="text-lg font-medium mb-4 max-sm:text-base">Host: {hostName}</p>

        <button
          onClick={createGame}
          className="w-full py-4 text-white font-bold rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-95 mb-4 cursor-pointer max-sm:py-3 max-sm:text-sm"
        >
          Create New Game
        </button>

        {/* Waiting games list */}
        {waitingGames.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2 max-sm:text-sm">Waiting Games</h3>
            <ul className="flex flex-col gap-2 max-h-40 overflow-y-auto max-sm:gap-1 max-sm:max-h-32">
              {waitingGames.map(game => (
                <li key={game.gameId} className="flex justify-between items-center border p-2 rounded-lg max-sm:p-1">
                  <span>Game ID: {game.gameId} ({game.players} player(s))</span>
                  <button
                    onClick={() => joinGame(game.gameId)}
                    className="px-3 py-1 text-white rounded bg-blue-500 hover:bg-blue-600 hover:scale-95 cursor-pointer max-sm:px-2 max-sm:py-0.5 max-sm:text-sm"
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Manual game join */}
        <div className="flex gap-4 max-sm:flex-col max-sm:gap-2">
          <input
            type="text"
            value={gameIdInput}
            onChange={(e) => setGameIdInput(e.target.value)}
            placeholder="Enter Game ID to Join"
            className="flex-1 p-2 border rounded-xl max-sm:p-1.5 max-sm:text-sm"
          />
          <button
            onClick={() => joinGame()}
            className="px-4 py-2 text-white font-bold rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-95 cursor-pointer max-sm:px-3 max-sm:py-1 max-sm:text-sm"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineLobbyModal;
