import React, { useEffect, useRef, useState } from 'react'

const Dice = ({ name, player, diceRoll, onDiceRoll, disabled }) => {

  const [rolling, setRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState(diceRoll?.value?? null);
  const rollSound = useRef(null);
  const callInProgress = useRef(false);

  useEffect(() => {
    rollSound.current = new Audio("/sounds/diceRoll.mp3");
    rollSound.current.volume = 0.6;
  }, []);

  // Props: value = dice value, rollCount = increments each roll
  useEffect(() => {
    if (!diceRoll || diceRoll.value === undefined) {
      return;
    } 
    
    setRolling(true);
    setDisplayValue(null);
    
    // Play sound for both bot and human
    if (rollSound.current) {
      const sound = rollSound.current.cloneNode();
      sound.play().catch(() => {});
    }

    const timer = setTimeout(() => {
      setDisplayValue(diceRoll.value);
      setRolling(false);
      callInProgress.current = false;
    }, 600);
    return () => clearTimeout(timer);
  }, [diceRoll?.rollId]);

  const rollDice = async () => {
    if(!player || !player.playerId) {
      console.error("❌ Missing player in Dice component!", player);
      return;
    }
    if(rolling || callInProgress.current) return;
    // if(displayValue !== null) return;
    
    callInProgress.current = true;
    setRolling(true); 

    try {
      if(rollSound.current) {
        const sound = rollSound.current.cloneNode();
        sound.play().catch(() => {});
      }

      // Show a fake quick animation before actual fetch result
      setDisplayValue(null);

      console.log("Rolling dice for player:", player.playerId);
      const res = await fetch(`http://localhost:8080/api/game/roll?playerId=${player.playerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if(!res.ok) {
        const errorData = await res.json();
        console.error("Error: ", errorData);
        throw new Error(errorData || "Failed to roll dice");
      }

      const data = await res.json();
      console.log(data.value);

      // Small delay to let animation play before showing new dots
      setTimeout(() => {
        setDisplayValue(data.value);
        if(onDiceRoll) {
          onDiceRoll(data.value);
        } 
        setRolling(false);
      }, 600);
    } catch(err) {
      console.log('Error rolling dice', err);
    }
  }

  // Map dice value to dot positions on a 3x3 grid
  const renderDots = (val) => {
    const positions = [
      [], // 0
      [4], // 1
      [0, 8], // 2
      [0, 4, 8], // 3
      [0, 2, 6, 8], // 4
      [0, 2, 4, 6, 8], // 5
      [0, 2, 3, 5, 6, 8], // 6
    ];

    const dots = positions[val] || [];
    return Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className='flex items-center justify-center'
      >
        <div
          className={`w-2.5 h-2.5 rounded-full bg-gray-800 ${
            dots.includes(i) ? 'opacity-100' : 'opacity-0'
            }`}
        ></div>
      </div>
      
    ));
  }; 

  return (
    <div className="mt-auto bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center gap-2">
        <div className="text-gray-600 mb-2">{name}'s Dice</div>
        <div className={`w-20 h-20 bg-white border-4 border-gray-300 rounded-xl shadow-md grid grid-cols-3 grid-rows-3 gap-1 p-2 cursor-pointer ${
            rolling ? 'animate-diceRoll' : 'hover:scale-105 transition-transform'
          }`}
          onClick={!rolling && !player.isBot && !disabled ? rollDice : undefined}
        >
            {/* <div className='text-2xl font-bold text-gray-700'>
              {value ?? '-'}
            </div> */}
            {!rolling && displayValue && renderDots(displayValue)}
        </div>
    </div>
  )
}

export default Dice