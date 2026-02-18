import Link from "next/link";
import React from "react";

const Box = (props) => {
  const isLinkValid = props?.link !== null && props?.link !== undefined;
  
  const gradientMap = {
    'bg-[#10b981]': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'bg-[#3872fa]': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'bg-[#4f49e4]': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'bg-[#f22c61]': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  };

  const gradient = gradientMap[props?.bg] || 'linear-gradient(135deg, #D96F32 0%, #E88A4D 100%)';
  
  const content = (
    <div className="w-full p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-premium transition-smooth cursor-pointer flex items-center justify-between group overflow-hidden relative animate-scaleIn" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
    }}>
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-smooth" style={{
        background: gradient
      }}></div>
      
      <div className="flex flex-col gap-2 relative z-10">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
          {props?.title}
        </p>
        <h2 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-gray-800 group-hover:scale-105 transition-smooth leading-none">{props?.count}</h2>
      </div>
      
      <div 
        className="p-5 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-smooth relative z-10"
        style={{
          background: gradient
        }}
      >
        {props?.icon}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-smooth" style={{
        background: gradient
      }}></div>
    </div>
  );

  return isLinkValid ? (
    <Link href={props?.link}>
      {content}
    </Link>
  ) : (
    content
  );
};

export default Box;
