import React from 'react'

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export default Spinner