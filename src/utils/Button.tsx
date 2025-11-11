import React from 'react';

interface ButtonProps {
  status: string;
}

const Button: React.FC<ButtonProps> = ({ status }) => {
  return ( status==="paid"?
    <div className="relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-[#3ffd68] to-[#18f888] transition-all duration-200 ease-linear hover:scale-105">
      <button
        type="button"
        className="relative inline-flex items-center justify-center h-10 w-20 overflow-hidden rounded-md bg-gradient-to-b from-[#71ff94] to-[#71ffbd] transition-all duration-300 ease-in-out hover:scale-95"
      >
        <span className="absolute top-0 right-0 h-4 w-4 rounded-tr-md rounded-bl-md bg-gradient-to-b from-[#71ff89] to-[#71ffa7] shadow-md transition-all duration-500 ease-in-out transform-gpu hover:-translate-y-4 hover:-translate-x-4"></span>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <i
              key={i}
              className={`absolute bottom-0 h-[2px] w-[2px] bg-blue-600 rounded-full animate-floating-points delay-[${i * 0.2}s]`}
              style={{ left: `${Math.random() * 100}%`, animationDuration: `${1.5 + Math.random()}s` }}
            ></i>
          ))}
        </div>

        <span className="relative z-10 flex items-center gap-1 text-white font-medium text-lg">
          <svg
            className="w-5 h-5 text-white transition-colors duration-200 ease-in-out"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline
              points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37"
              className="stroke-[2.5] stroke-current transition-all duration-700 ease-in-out"
            />
          </svg>
          {status}
        </span>
      </button>
    </div>:
    <div className="relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-[#f34c4c] to-[#fa9f49] transition-all duration-200 ease-linear hover:scale-105">
    <button
      type="button"
      className="relative inline-flex items-center justify-center h-10 w-20 overflow-hidden rounded-md bg-gradient-to-b from-[#ff8466] to-[#f86945] transition-all duration-300 ease-in-out hover:scale-95"
    >
      <span className="absolute top-0 right-0 h-4 w-4 rounded-tr-md rounded-bl-md bg-gradient-to-b from-[#fa5454] to-[#f58e19] shadow-md transition-all duration-500 ease-in-out transform-gpu hover:-translate-y-4 hover:-translate-x-4"></span>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <i
            key={i}
            className={`absolute bottom-0 h-[2px] w-[2px] bg-blue-600 rounded-full animate-floating-points delay-[${i * 0.2}s]`}
            style={{ left: `${Math.random() * 100}%`, animationDuration: `${1.5 + Math.random()}s` }}
          ></i>
        ))}
      </div>

      <span className="relative z-10 flex items-center gap-1 text-white font-medium text-base">
        <svg
          className="w-5 h-5 hover:fill-white text-white transition-colors duration-200 ease-in-out"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37"
            className="stroke-[2.5] stroke-current transition-all duration-700 ease-in-out"
          />
        </svg>
        {status}
      </span>
    </button>
  </div>
  );
};

export default Button;
