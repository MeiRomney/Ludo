import { Home, RefreshCw, Trophy } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

// const API_BASE = "http://localhost:8080/";
const API_BASE = import.meta.env.VITE_API_BASE;

const Results = () => {

  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const finalGame = JSON.parse(localStorage.getItem("FinalGame"));
    if(!finalGame?.gameId) return;

    fetch(`${API_BASE}api/game/results?gameId=${encodeURIComponent(finalGame.gameId)}`)
      .then(res => res.json())
      .then(data => {
        console.log("Results fetched: ", data);
        if(data.scoreboard) {
          setResults(
            data.scoreboard.map((p, i) => ({
              position: i + 1, 
              color: 
                p.color === "yellow"
                ? '#FFD93D'
                : p.color === "red"
                ? '#FF4C4C'
                : p.color === "blue"
                ? '#4C6FFF'
                : '#28A745',
                name: p.name,
                finished: p.finished,
                inPlay: p.inPlay,
                atHome: p.atHome,
            }))
          );
          setWinner(data.winner);
        }
      })
      .catch((err) => console.log("Error fetching results:", err));
  }, []);

  const handleReturnHome = async () => {
    const finalGame = JSON.parse(localStorage.getItem("FinalGame"));
    if(finalGame?.gameId) {
      try {
        await fetch(`${API_BASE}api/game/end?gameId=${encodeURIComponent(finalGame.gameId)}`, { method: "POST" });
      } catch(err) {
        console.log("Error ending game:", err);
      }
    }
    localStorage.removeItem("FinalGame");
    navigate("/");
  }

  const handlePlayAgain = async () => {
    const finalGame = JSON.parse(localStorage.getItem("FinalGame"));
    if(finalGame?.gameId) {
      try {
        await fetch(`${API_BASE}api/game/end?gameId=${encodeURIComponent(finalGame.gameId)}`, { method: "POST" });
      } catch(err) {
        console.log("Error ending game:", err);
      }
    }
    localStorage.removeItem("FinalGame");
    navigate("/gameplay-modal");
  }

  return (
    <div className='w-full h-full bg-yellow-50 absolute flex flex-col justify-center items-center pt-15 max-sm:pt-10'>
      <div className='flex flex-col justify-center items-center'>
        <div className='w-25 h-25 -mt-20 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 shadow-md flex justify-center items-center max-sm:w-20 max-sm:h-20'>
          <Trophy className='w-20 h-20 text-white max-sm:w-16 max-sm:h-16' />
        </div>
        <h1 className='text-3xl font-bold text-yellow-300 text-shadow-md max-sm:text-2xl'>Winner</h1>
        {winner && (
          <div className='w-full bg-white shadow-md rounded-3xl flex my-2 p-2 items-center gap-2 max-sm:w-11/12'>
            <div 
              className={`w-6 h-6 rounded-full max-sm:w-5 max-sm:h-5`}
              style={{
                backgroundColor:
                  results.find((r) => r.name === winner)?.color || '#FFD93D',
              }} ></div>
            <h2 className='text-lg max-sm:text-base'>{winner}</h2>
          </div>
        )}
        
      </div>
      <div className='w-1/2 rounded-2xl bg-white shadow-lg mx-auto flex flex-col p-7 max-sm:w-11/12 max-sm:p-4'>
        <h2 className='text-2xl text-gray-500 max-sm:text-xl'>Final Scoreboard</h2>
        <div className="space-y-3">
          {results.map((result) => (
            <div 
              key={result.position} 
              className={`flex items-center justify-between h-20 rounded-xl px-6 transition-all max-sm:h-16 max-sm:px-3 ${
                result.position === 1 
                  ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400' 
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4 max-sm:gap-2">
                <div className="w-12 h-12 bg-gray-700 text-white rounded-full flex items-center justify-center shadow-md max-sm:w-10 max-sm:h-10">
                  {result.position === 1 
                  ? '🥇' 
                  : result.position === 2 
                  ? '🥈' 
                  : result.position === 3 
                  ? '🥉' 
                  : result.position}
                </div>
                <div className="w-10 h-10 rounded-full shadow-md max-sm:w-8 max-sm:h-8" style={{ backgroundColor: result.color }}></div>
                <span className="text-gray-800 min-w-[80px] max-sm:text-sm">{result.name}</span>
              </div>
              <div className="flex gap-8 max-sm:gap-4">
                <div className="text-center">
                  <div className="text-lg text-gray-800 max-sm:text-base">{result.finished}</div>
                  <div className="text-xs text-gray-500 max-sm:text-[10px]">Finished</div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-gray-800 max-sm:text-base">{result.inPlay}</div>
                  <div className="text-xs text-gray-500 max-sm:text-[10px]">In Play</div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-gray-800 max-sm:text-base">{result.atHome}</div>
                  <div className="text-xs text-gray-500 max-sm:text-[10px]">At Home</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 w-full max-w-md mt-5 max-sm:px-2">
        <button onClick={handlePlayAgain} className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer max-sm:h-12">
          <RefreshCw className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
          Play Again
        </button>
        <button onClick={handleReturnHome} className="flex-1 h-14 bg-white text-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer max-sm:h-12">
          <Home className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
          Home
        </button>
      </div>
    </div>
  )
}

export default Results