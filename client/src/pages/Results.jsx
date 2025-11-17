import { Home, RefreshCw, Trophy } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Results = () => {

  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const finalGame = JSON.parse(localStorage.getItem("FinalGame"));
    if(!finalGame?.gameId) return;

    fetch(`http://localhost:8080/api/game/results?gameId=${encodeURIComponent(finalGame.gameId)}`)
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
        await fetch(`http://localhost:8080/api/game/end?gameId=${encodeURIComponent(finalGame.gameId)}`, { method: "POST" });
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
        await fetch(`http://localhost:8080/api/game/end?gameId=${encodeURIComponent(finalGame.gameId)}`, { method: "POST" });
      } catch(err) {
        console.log("Error ending game:", err);
      }
    }
    localStorage.removeItem("FinalGame");
    navigate("/gameplay-modal");
  }

  return (
    <div className='w-full h-full bg-yellow-50 absolute flex flex-col justify-center items-center pt-15'>
      <div className='flex flex-col justify-center items-center'>
        <div className='w-25 h-25 -mt-20 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 shadow-md flex justify-center items-center'>
          <Trophy className='w-20 h-20 text-white' />
        </div>
        <h1 className='text-3xl font-bold text-yellow-300 text-shadow-md'>Winner</h1>
        {winner && (
          <div className='w-full bg-white shadow-md rounded-3xl flex my-2 p-2 items-center gap-2'>
            <div 
              className={`w-6 h-6 rounded-full`}
              style={{
                backgroundColor:
                  results.find((r) => r.name === winner)?.color || '#FFD93D',
              }} ></div>
            <h2>{winner}</h2>
          </div>
        )}
        
      </div>
      <div className='w-1/2 rounded-2xl bg-white shadow-lg mx-auto flex flex-col p-7'>
        <h2 className='text-2xl text-gray-500'>Final Scoreboard</h2>
        <div className="space-y-3">
          {results.map((result) => (
            <div 
              key={result.position} 
              className={`flex items-center justify-between h-20 rounded-xl px-6 transition-all ${
                result.position === 1 
                  ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400' 
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 text-white rounded-full flex items-center justify-center shadow-md">
                  {result.position === 1 
                  ? '🥇' 
                  : result.position === 2 
                  ? '🥈' 
                  : result.position === 3 
                  ? '🥉' 
                  : result.position}
                </div>
                <div className="w-10 h-10 rounded-full shadow-md" style={{ backgroundColor: result.color }}></div>
                <span className="text-gray-800 min-w-[80px]">{result.name}</span>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-lg text-gray-800">{result.finished}</div>
                  <div className="text-xs text-gray-500">Finished</div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-gray-800">{result.inPlay}</div>
                  <div className="text-xs text-gray-500">In Play</div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-gray-800">{result.atHome}</div>
                  <div className="text-xs text-gray-500">At Home</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 w-full max-w-md mt-5">
        <button onClick={handlePlayAgain} className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer">
          <RefreshCw className="w-5 h-5" />
          Play Again
        </button>
        <button onClick={handleReturnHome} className="flex-1 h-14 bg-white text-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer">
          <Home className="w-5 h-5" />
          Home
        </button>
      </div>
    </div>
  )
}

export default Results