'use client'
import { Button } from '@mui/material'
import React, { useState } from 'react'
import { LiaAngleDownSolid } from 'react-icons/lia';
import { TfiAngleUp } from 'react-icons/tfi';

const QtyBox = () => {

  const [qtyValue, setQtyValue] = useState(1);
  
  const minusQty = () => {
    if(qtyValue===1){
      setQtyValue(1);
    }else {
      setQtyValue(qtyValue-1);
    }
  }
  
  return (
    <div className='qtyBox border border-[rgba(0,0,0,0.2)] rounded-md flex items-center gap-1 w-[100px] h-[40px] relative'>
      <input type="number" className='border-0 outline-none w-full h-full px-4 text-[14px] text-gray-700' value={qtyValue} onChange={(e) => setQtyValue(parseInt(e.target.value) || 1)}/>
      <div className='flex flex-col absolute top-0 right-0 h-full'>
        <Button className='!w-[24px] !min-w-[25px] !h-[20px] !text-gray-800' onClick={()=>setQtyValue(qtyValue+1)}>
          <TfiAngleUp size={20}/>
        </Button>
        <Button className='!w-[24px] !min-w-[25px] !h-[20px] !text-gray-800' onClick={minusQty}>
          <LiaAngleDownSolid size={20}/>
        </Button>
      </div>
    </div>
  )
}

export default QtyBox
