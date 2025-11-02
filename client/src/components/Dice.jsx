import React, { useState } from 'react'

const Dice = ({ name, player, onDiceRoll }) => {

  const [value, setValue] = useState(null);
  const [rolling, setRolling] = useState(false);

  const rollDice = async () => {
    setRolling(true);
    try {
      const res = await fetch('http://localhost:8080/api/game/roll');
      const data = await res.json();
      setValue(data);
      console.log(`${name} rolled a ${data}`);

      if(onDiceRoll) onDiceRoll(data);
    } catch(err) {
      console.log('Error rolling dice', err);
    } finally {
      setRolling(false);
    }
  }

  return (
    <div className="mt-auto bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center gap-0">
        <div className="text-gray-600 mb-2">{name}'s Turn</div>
        <div className={`w-20 h-20 bg-white border-4 border-gray-300 rounded-xl shadow-md flex items-center justify-center cursor-pointer ${
            rolling ? 'opacity-50' : 'hover:scale-105 transition'
          }`}
          onClick={!rolling ? rollDice : undefined}
        >
            {/* <div className="grid grid-cols-2 gap-2 p-2">
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            </div> */}
            <div className='text-2xl font-bold text-gray-700'>
              {value || '-'}
            </div>
        </div>
    </div>
  )
}

export default Dice