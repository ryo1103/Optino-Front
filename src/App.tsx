import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './compoments/header';
import Trade from './trade';
import About from './about';
import Stake from './stake';
import Result from './result';
import { BackgroundImage, Center, Text, Box } from '@mantine/core';
import back1 from  './assets/images/back1.png'
import back4 from  './assets/images/back4.png'
import back5 from  './assets/images/back5.png'
import back6 from  './assets/images/back6.png'
import back9 from  './assets/images/back9.png'
import { lazy } from "react";
import { Route, Routes, useLocation} from "react-router-dom";
import "./App.css";

// const Trade = lazy(() => import("./trade"));


function App() {
  const [back, setBack]= useState('')
  const { pathname } = useLocation();
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
    <>
    
     <BackgroundImage
        src={back}
        style={{height:'100vh' }}

      >
      <Routes>
      <Route path="/" element={<Trade />}/>
      <Route path="/trade" element={<Trade />}/>
      <Route path="/about" element={<About />}/>
      <Route path="/stake" element={<Stake/>}/>
      <Route path="/result/success" element={<Result/>}/>
      <Route path="/result/fail" element={<Result/>}/>


     {/* <Route path="/stake" element={<Vaults/>} /> */}
    </Routes>
      </BackgroundImage>
    </>
  );
}

export default App;
