import React, { useEffect, useRef, useState } from 'react'

const Dice = ({ name, player, diceRoll, onDiceRoll }) => {

  const [rolling, setRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState(diceRoll?.value?? null);
  const rollSound = useRef(null);

  useEffect(() => {
    rollSound.current = new Audio("/sounds/diceRoll.mp3");
    rollSound.current.volume = 0.6;
  }, []);

  // useEffect(() => {
  //   if(value != null && value !== displayValue) {
  //     // Play sound when bot rolls
  //     if(player?.isBot && rollSound.current) {
  //       const sound = rollSound.current.cloneNode();
  //       sound.play().catch(() => {})
  //     }
  //     setRolling(true);
  //     setTimeout(() => {
  //       setDisplayValue(value);
  //       setRolling(false);
  //     }, 600);
  //   }
  // }, [value, rollCount])

  // Props: value = dice value, rollCount = increments each roll
  useEffect(() => {
    if (!diceRoll) return;
    
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
    }, 600);
    return () => clearTimeout(timer);
  }, [diceRoll?.rollId]); // or [rollCount] if you have a separate roll tracker


  const rollDice = async () => {
    if(!player || !player.playerId) {
      console.error("❌ Missing player in Dice component!", player);
      return;
    }

    setRolling(true);
    try {
      if(rollSound.current) {
        const sound = rollSound.current.cloneNode();
        sound.play().catch(() => {});
      }

      // Show a fake quick animation before actual fetch result
      setDisplayValue(null);

      const res = await fetch(`http://localhost:8080/api/game/roll?playerId=${player.playerId}`);

      if(!res.ok) {
        const errorData = await res.json();
        console.error("Error: ", errorData);
        throw new Error(errorData || "Failed to roll dice");
      }

      const data = await res.json();

      // Small delay to let animation play before showing new dots
      setTimeout(() => {
        setDisplayValue(data);
        if(onDiceRoll) onDiceRoll(data);
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
        <div className="text-gray-600 mb-2">{name}'s Turn</div>
        <div className={`w-20 h-20 bg-white border-4 border-gray-300 rounded-xl shadow-md grid grid-cols-3 grid-rows-3 gap-1 p-2 cursor-pointer ${
            rolling ? 'animate-diceRoll' : 'hover:scale-105 transition-transform'
          }`}
          onClick={!rolling && !player.isBot ? rollDice : undefined}
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