import Link from "next/link";
import React from "react";

const Box = (props) => {
  return (
    <>
      {props?.link !== null && props?.link !== undefined ? (
        <Link
          href={props?.link}
          className={`p-5 flex items-center gap-5 rounded-md ${props?.bg} hover:opacity-85`}
        >
          <div className="info">
            <h5 className="text-white opacity-85 text-[16px]">
              {props?.title}
            </h5>
            <h2 className="text-white text-[25px] font-bold">{props?.count}</h2>
          </div>

          {props?.icon}
        </Link>
      ) : (
        <Link
          href={props?.link}
          className={`p-5 flex items-center gap-5 rounded-md ${props?.bg}`}
        >
          <div className="info">
            <h5 className="text-white opacity-85 text-[16px]">
              {props?.title}
            </h5>
            <h2 className="text-white text-[25px] font-bold">{props?.count}</h2>
          </div>

          {props?.icon}
        </Link>
      )}
    </>
  );
};

export default Box;
