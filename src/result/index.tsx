import { Button, Text, BackgroundImage, Container, Group, Image, SegmentedControl, Grid, Divider, Space, createStyles, Select, Stack, Flex, Paper, Input, TextInput, Slider, Drawer, Title, Modal, Tooltip,Box, List,Mark} from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Header from '../compoments/header';
import time from '../assets/images/time.png'
import { injected } from '../connectors';
import { useWeb3React } from '@web3-react/core';
import { useNavigate,useLocation} from 'react-router-dom';
import cat from '../assets/images/cat1.png'
import sad from '../assets/images/sad.png'

 
const useStyles = createStyles((theme) => ({
    root:{
        border: '1px solid rgba(246, 245, 255, 1)',
        color:'rgba(7, 0, 92, 1)',
        background: 'rgba(21, 250, 38, 0.3)',
        '&:not([data-disabled])': theme.fn.hover({
            backgroundColor: 'rgba(21, 250, 38, 0.5)',
          }),
       // height:'96px',
        fontSize:'27px',
        fontWeight:400,

    },
    inner:{
        marginRight:'25px'
    },
    
}))

function Result (){
    const { classes, cx } = useStyles();
    const navigate = useNavigate();
    const {pathname} = useLocation()
    





    return (
        <Header>
    
           
            
            <BackgroundImage
        src={ pathname.includes('success') ? cat : sad }
        style={{width:'80vw', height:'100vh', backgroundSize: 'contain',backgroundRepeat: 'no-repeat', position:'fixed',bottom:'-160px'}}

      ></BackgroundImage>
            <Group position='right'>
                <div style={{width:'28%'}}>
                
                    <Flex direction={'column'} mt={20}>
                        
                        <Text c='#fff' fz={20}>Current Price</Text>
                        <Title c='#fff' order={4}>{pathname.includes('success') ? '1640.00' :'1660.00'}</Title>
                        <Text c='#fff' fz={20}>04:15pm</Text>
                    </Flex>
                    <Flex direction={'column'} mt={40}>
                        <Text c='#07005C' fz={20}>Strike Price</Text>
                        <Title c='#07005C' order={4}>1650.00</Title>
                        <Text c='#07005C' fz={20}>04:15pm</Text>
                    </Flex>


                    <Button mt={90} classNames={{root: classes.root,inner:classes.inner}} size='xl' radius="md"  onClick={()=>navigate("/trade")}>Play Again</Button>

                </div>
                
                
            </Group>

            
        </Header>
    )
}

export default Result