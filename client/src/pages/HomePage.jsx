import React from 'react'
import LudoImg from '../assets/Ludo.png'
import { Outlet, useNavigate } from 'react-router-dom'
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react'

const HomePage = () => {

  const navigate = useNavigate()
  const { isSignedIn } = useUser()

  return (
    <>
      <div className='relative flex flex-col items-center justify-center h-screen pb-40 bg-gradient-to-r from-purple-200 to-pink-200 max-sm:pb-20 max-sm:px-4'>
        {/* Top bar for profile/sign in */}
        <div className='absolute top-5 right-5 flex items-center gap-4 max-sm:top-3 max-sm:right-3 max-sm:gap-2'>
          {isSignedIn ? (
            <UserButton afterSignOutUrl='/' appearance={{
              elements: { userButtonAvatarBox: "w-10 h-10 max-sm:w-8 max-sm:h-8" }
            }} />
          ) : (
            <SignInButton mode='modal'>
              <button className='px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-md hover:scale-95 transform transition max-sm:px-3 max-sm:py-1.5 max-sm:text-sm'>
                Sign In
              </button>
            </SignInButton>
          )}
        </div>

        {/* Logo and title */}
        <div className='w-30 h-30 max-sm:w-24 max-sm:h-24'>
          <img src={LudoImg} alt="ludo" className='max-sm:w-24'/>
        </div>
        <h1 className='text-center text-3xl font-semibold max-sm:text-2xl'>Ludo RAY</h1>
        <p className='max-sm:text-sm'>Classic board game fun!</p>
        <button onClick={()=> navigate('gameplay-modal')} className='w-1/4 m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-95 transform cursor-pointer max-sm:w-3/4 max-sm:p-2 max-sm:text-sm'>Start Game</button>
        <button onClick={()=> navigate('how-to-play')} className='w-1/4 m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 border-2 border-purple-500 hover:scale-95 hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:border-none hover:text-white transform cursor-pointer max-sm:w-3/4 max-sm:p-2 max-sm:text-sm'>How to play</button>
        <button onClick={()=> navigate('setting')} className='w-1/4 m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 border-2 border-purple-500 hover:scale-95 hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:border-none hover:text-white transform cursor-pointer max-sm:w-3/4 max-sm:p-2 max-sm:text-sm'>Setting</button>
      </div>
      <Outlet />
    </>
  )
}

export default HomePage