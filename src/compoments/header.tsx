import { Button, Text, Container, Group, Image, Burger, Grid, Divider, Space, createStyles, BackgroundImage, Flex, Title} from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import back3 from  '../assets/images/back3.png'
import logo from '../assets/images/logo.png'
import { NavLink, useLocation } from 'react-router-dom';

const useStyles = createStyles((theme) => ({
    header:{
        width:'100%',
        height: '12vh',
        display: 'flex',
        flexDirection:'row',
        padding:'0 120px',
        justifyContent:'space-between',
        alignItems:'center'

    },
    link: {
        //display: 'block',
        fontWeight: 400,
        fontSize: '40px',
        lineHeight: '73px',

        color: '#07005C',

        padding: '8px 12px',
        // borderRadius: theme.radius.sm,
        textDecoration: 'none',
    
        '&:hover': {
          color: '#fff' 
        },
      },
    
      linkActive: {
        '&, &:hover': {
         // backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
        //  color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        color:  '#fff' 
        },
      },
    
}))

//@ts-ignore
export  function Header({children }) {
    const { classes, cx } = useStyles();
    const [opened, { toggle }] = useDisclosure(false);
    const { pathname } = useLocation();
    const label = opened ? 'Close navigation' : 'Open navigation';
    return (
        <>
       { opened ?
        <BackgroundImage
        src={back3}
        style={{height:'100vh'}}

      >
        <div className={classes.header}>
            
          {/*    <Image
            radius="md"
            src={logo}
            width={182}
            height={64}
            alt="Logo"

       /> 
       */}
          <img src={logo} alt=""  width={166} height={64}/>


            
         <Burger opened={opened} onClick={toggle} aria-label={label}/>

            

        </div>
        
        <Flex 
         mt={120}
         gap="xl"
         ml={120}
         justify="flex-start"
         align="flex-start"
         direction="column"
         wrap="wrap"
        >
          <NavLink
            to="/trade"
            className={({ isActive }) => (cx(classes.link, { [classes.linkActive]: pathname.includes('trade') }))}
            >
            Trade
          </NavLink>
          <NavLink
            to="/stake"
            className={({ isActive }) => (cx(classes.link, { [classes.linkActive]: pathname.includes('stake') }))}
            >
            Stake & Earn
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => (cx(classes.link, { [classes.linkActive]: pathname.includes('about') }))}
            >
            About
          </NavLink>
            

        </Flex>
        


      </BackgroundImage>

       

       : 
       <>
        <div className={classes.header} style={{backgroundColor:(pathname.includes('result') || pathname==='/about' || pathname==='/stake') ?'#fff':'transparent' }}>
            
            <img src={logo} alt=""  width={166} height={64}/>
            <Burger opened={opened} onClick={toggle} aria-label={label}/>

        </div>
        {children}
        </>

       }
        </>
    )
}

export default Header