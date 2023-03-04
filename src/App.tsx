import { BackgroundImage } from '@mantine/core';
import { createContext, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from "react-router-dom";
import About from './about';
import './App.css';
import back1 from './assets/images/back1.png';
import back4 from './assets/images/back4.png';
import back5 from './assets/images/back5.png';
import back6 from './assets/images/back6.png';
import back9 from './assets/images/back9.png';
import Result from './result';
import Stake from './stake';
import Trade from './trade';

// const Trade = lazy(() => import("./trade"));
export const Options: any =  createContext(null)


function App() {
  const [back, setBack]= useState('')
  const { pathname } = useLocation();

  const [options, setOptions] = useState([])
  const [rewards, setRewards] = useState(null)

  useEffect(()=>{
    console.log(pathname)
    if (pathname.includes('trade') ||  pathname==='/'){
      setBack(back1)
    }else if(pathname.includes('about')){
      setBack(back4)

    }else if(pathname.includes('stake')){
      setBack(back5)

    }else if(pathname.includes('success')){
      setBack(back9)

    }else if(pathname.includes('fail')){
      setBack(back6)

    }

  },[pathname])  

  return (
    <Options.Provider value={{
      options,
      setOptions,
      rewards,
      setRewards
    }}>
    
     <BackgroundImage
        src={back}
        style={{height:'100vh' }}

      >
      <Routes>
      <Route path="/" element={<Trade />}/>
      <Route path="/trade" element={<Trade />}/>
      <Route path="/about" element={<About />}/>
      <Route path="/stake" element={<Stake/>}/>
      {/* <Route path="/result" element={<Result/>}/> */}
      <Route path="/result/success" element={<Result/>}/>
      <Route path="/result/fail" element={<Result/>}/>
      


     {/* <Route path="/stake" element={<Vaults/>} /> */}
    </Routes>
      </BackgroundImage>
    </Options.Provider>
  );
}

export default App;
