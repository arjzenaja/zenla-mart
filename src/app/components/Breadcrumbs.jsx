import React from "react";
import Link from "next/link";
import { RiHome4Line, RiArrowRightSLine } from "react-icons/ri";

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">
      <Link 
        href="/" 
        className="hover:text-primary flex items-center gap-1 transition-colors duration-200"
      >
        <RiHome4Line size={13} className="mb-0.5" /> 
        Dashboard
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <RiArrowRightSLine size={14} className="text-gray-300" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-primary transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
