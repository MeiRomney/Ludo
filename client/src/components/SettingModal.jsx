import React, { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react';
import toast, { Toaster } from 'react-hot-toast';

// const API_BASE = "http://localhost:8080/";
const API_BASE = import.meta.env.VITE_API_BASE;

const Setting = () => {

  const navigate = useNavigate();
  const { user } = useUser();

  const [selectedColor, setSelectedColor] = useState('red');
  const [selectedType, setSelectedType] = useState('fourPlayers');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const types = [
    { name: 'fourPlayers', label: '4 Players' },
    { name: 'twoPlayers', label: '2 Players' },
  ]
  const colors = [
    { name: 'red', value: 'bg-red-500', hover: 'hover:bg-red-600' },
    { name: 'blue', value: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { name: 'green', value: 'bg-green-500', hover: 'hover:bg-green-600' },
    { name: 'yellow', value: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  ]

  useEffect(() => {
    const fetchPlayerSettings = async () => {
      if(!user) return;

      try {
        setLoading(true);
        const email = user?.primaryEmailAddress?.emailAddress;
        const res = await fetch(`${API_BASE}api/settings/by-email?email=${email}`);

        if(!res.ok) throw new Error("Failed to fetch player settings");

        const data = await res.json();

        if(data) {
          setName(data.name || selectedColor);
          setSelectedColor(data.color || 'red');
          setSelectedType(data.gameType || 'fourPlayer');
          console.log("🎯 Loaded settings:", data);
        } else {
          console.log("ℹ️ No existing settings found for this user");
          toast.error("Failed to load settings");
        }
      } catch (err) {
        console.log("Failed to fetch player's settings", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayerSettings();
  }, [user]);

  const apply = async () => {
    if(!user) {
      console.error("❌ User not logged in");
      toast.error("❌ User not logged in");
      return;
    }

    const payload = {
      name: name || selectedColor,
      color: selectedColor,
      gameType: selectedType,
      email: user.primaryEmailAddress?.emailAddress,
      clerkId: user.id,
    };

    try {
      const res = await fetch(`${API_BASE}api/settings/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if(!res.ok) throw new Error("Failed to save settings");

      const data = await res.json();
      console.log("✅ Settings saved:", data);
      toast.success("✅ Settings saved");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  }

  return (
    <div className='absolute inset-0 z-50 flex w-1/3 h-3/4 justify-center text-center items-center m-auto rounded-xl bg-gray-300 bg-opacity-50 max-sm:w-full max-sm:h-full max-sm:p-4 max-sm-rounded-none'>
      <Toaster position='top-center'/>
      <div className='relative p-10 rounded-xl w-[90%] h-[90%] flex flex-col bg-white shadow-lg max-sm:p-5 max-sm:w-[95%] max-sm:h-[95%]'>
        <h2 className='text-3xl font-bold text-gray-800 mb-4 text-center max-sm:text-2xl'>Settings</h2>
        <button onClick={()=> navigate('/')} className='absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer max-sm:w-5 max-sm:h-5'><X/></button>
        {loading ? (
          <div className='flex flex-1 justify-center items-center text-gray-600 max-sm:text-sm'>Loading settings...</div>
        ) : (
            <div className='flex flex-col items-center mt-4 space-y-6 max-sm:space-y-4'>
            {/* Name */}
            <div className='flex flex-col gap-0 my-0 mb-2 w-full'>
              <h3 className='text-lg font-medium text-gray-700 max-sm:text-base'>Enter Your Name</h3>
              <input 
                type="text" 
                placeholder={`${selectedColor}`} 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full border border-gray-500 rounded-xl p-2 max-sm:p-1.5' />
            </div>
            

            {/* Game Type */}
            <h3 className='text-lg font-medium text-gray-700 mb-2 max-sm:text-base'>Select Game Type</h3>
            <div className='flex flex-col w-full space-y-3 max-sm:space-y-2'>
              {types.map((type)=>(
                <button
                  key={type.name}
                  onClick={() => setSelectedType(type.name)}
                  className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all duration-200 cursor-pointer max-sm:py-2
                    ${
                    selectedType === type.name
                      ? 'bg-blue-500 text-white scale-[1.02]'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Color selection */}
            <div className='w-full'>
              <h3 className='text-lg font-medium text-gray-700 mb-2 max-sm:text-base'>Select Color</h3>
              <div className='flex justify-center gap-5 max-sm:gap-3'>
                {colors.map((color)=> (
                  <button 
                  key={color.name}
                  onClick={()=> setSelectedColor(color.name)}
                  className={`w-12 h-12 rounded-full border-4 transition-all duration-200 cursor-pointer ${color.value} ${color.hover}
                  ${
                  selectedColor === color.name
                  ? 'scale-110 border-gray-800 shadow-lg'
                  : 'border-transparent opacity-80 hover:opacity-100'
                  } max-sm:w-10 max-sm:h-10`}
                  title={color.name}/>
                ))}
              </div>
              <p className='mt-3 text-sm text-gray-600 max-sm:text-xs'>
                Selected Color: <span className='font-semibold'>{selectedColor}</span>
              </p>
            </div>
          </div>
        )}
        
        {/* Apply button */}
        <button onClick={apply} className='absolute bottom-4 right-4 w-20 h-8 flex text-center justify-center items-center rounded-full bg-green-500 text-white hover:bg-green-700 hover:scale-105 cursor-pointer max-sm:w-16 max-sm:h-7'>
          <Check className='w-5 h-5 max-sm:w-4 max-sm:h-4'/>
          Apply
        </button>
      </div>
    </div>
  )
}

export default Setting