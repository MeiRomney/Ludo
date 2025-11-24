import { useClerk, useUser } from '@clerk/clerk-react';
import { X } from 'lucide-react';
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import OnlineLobbyModal from './OnlineLobbyModal';

// const API_BASE = "http://localhost:8080/";
const API_BASE = import.meta.env.VITE_API_BASE;

const GamePlayModal = () => {

  const [showOnlineLobby, setShowOnlineLobby] = useState(false);

  const navigate = useNavigate();
  const { user } = useUser();
  const { redirectToSignIn } = useClerk();

  const startComputerGame = async () => {
    if(!user) {
      toast.error("Please log in before starting a game!");
      redirectToSignIn();
      return;
    }
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      const res = await fetch(`${API_BASE}api/game/start?email=${encodeURIComponent(email)}`, { method: 'POST' });

      if(!res.ok) throw new Error("Failed to start computer game");

      const data = await res.json();
      console.log("📥 Server Response:", data);

      const game = data.game;
      const playerId = data.playerId;

      if(!game?.gameId) {
        throw new Error("Server did not return a gameId");
      }
      console.log(game.gameId);

      navigate('/gameplay', { 
        state: { 
          mode: 'computer', 
          gameId: game.gameId, 
          playerId: playerId,
        } 
      });
    } catch (err) {
      console.error("Error starting game:", err);
      toast.error("Failed to start computer game");
    }
  };

  return (
    <div className='absolute inset-0 z-50 flex w-1/3 h-3/4 justify-center text-center items-center m-auto rounded-xl bg-gray-300 bg-opacity-50'>
      <Toaster position='top-center'/>
      <div className='relative p-10 rounded-xl w-[90%] h-[90%] flex flex-col bg-white shadow-lg'>
        <h2 className='text-2xl font-semibold mb-4'>Choose Game Mode</h2>
        <button onClick={()=> navigate('/')} className='absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer'><X/></button>
        <div className='flex flex-col p-10 gap-10 justify-center items-center text-center'>
            <button onClick={() => setShowOnlineLobby(true)} className='w-full py-10 rounded-xl text-white font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-95 cursor-pointer'>
                Online
            </button>
            {showOnlineLobby && (
              <OnlineLobbyModal onClose={() => setShowOnlineLobby(false)}/>
            )}
            <button onClick={ startComputerGame }  className='w-full py-10 rounded-xl text-white font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-95 cursor-pointer'>
                VS Computer
            </button>
        </div>
        
      </div>
    </div>
  )
}

export default GamePlayModal