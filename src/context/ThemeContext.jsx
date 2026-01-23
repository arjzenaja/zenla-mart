'use client'
import { useState } from "react"
import { MyContext } from "./ThemeProvider"

const ThemeProvider = ({children}) => {

  const [isOpenAddressBox, setIsOpenAddressBox] = useState(false);

  const isOpenAddressPanel = (newOpen) => {
    setIsOpenAddressBox(newOpen);
  }

  const value = {
    setIsOpenAddressBox,
    isOpenAddressBox,
    isOpenAddressPanel
  };

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  )

}

export default ThemeProvider;