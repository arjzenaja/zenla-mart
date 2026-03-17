import Link from "next/link";
import React from "react";
import { LuArrowUpRight } from "react-icons/lu";

const Box = (props) => {
  const isLinkValid = props?.link !== null && props?.link !== undefined;

  const content = (
    <div className="group w-full p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-lg shadow-sm transition-all duration-300 cursor-pointer relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.06] ${props?.bg || 'bg-primary'}`}></div>

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
            {props?.title}
          </p>
          <h2 className="text-4xl font-black text-gray-800 mt-1">{props?.count}</h2>
        </div>

        <div className={`p-3.5 rounded-2xl ${props?.bg || 'bg-primary'} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {props?.icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-primary transition-colors duration-200">
        <LuArrowUpRight size={14} />
        <span>View details</span>
      </div>
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
