import { Button, Text, BackgroundImage, Container, Group, Image, SegmentedControl, Grid, Divider, Space, createStyles, Select, Stack, Flex, Paper, Input, TextInput, Slider, Drawer, Title, Modal, Tooltip,Box, List,Mark} from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Header from '../compoments/header';
import time from '../assets/images/time.png'
import { injected } from '../connectors';
import { useWeb3React } from '@web3-react/core';

 





const useStyles = createStyles((theme) => ({
    back:{
        backgroundImage:`url(../assets/images/back1.png) cover`,

    },
    pannel:{
        border:'1px solid #07005C',
        background: '#E6EBEB',
        margin:0,
        height:'35vh',
        flexDirection:'row',
        padding:'0 60px',
        alignItems:'center',
        position:'fixed',
        bottom:0,
        
        
    },
    disable:{
        border:'1px solid rgba(7, 0, 92, 0.16)',
        background:'rgba(21, 250, 38, 0.07)',
        margin:0,
        height:'35vh',
        flexDirection:'row',
        padding:'0 60px',
        alignItems:'center',
        position:'fixed',
        bottom:0,

    },
    countDown:{
        width:'220px',
        height:'60px',
        marginTop:'24px',
        marginBottom:'24px',
        backgroundColor:'rgba(242, 0, 177, 1)',
        color:'rgba(246, 245, 255, 1)',
  

        verticalAlign:'center',

        lineHeight:'60px',
        paddingLeft:'20px',
        fontSize:'36px',
        borderRadius:'8px',
        border: '1px solid rgba(246, 245, 255, 1)',
        opacity:0.88,


    },
    root:{
        border: '0.5px solid #707070',
        color:'#07005C',
        background:'rgba(255,255,255,0.3)',
        '&:not([data-disabled])': theme.fn.hover({
            backgroundColor: 'rgba(255,255,255,0.7)',
          }),
       // height:'96px',

        fontWeight:400,


        

    },
    confirm:{
        border: '1px solid rgba(12, 219, 4, 1)',
        color:'rgba(7, 0, 92, 1)',
        background:'rgba(21, 250, 38, 0.3)',
        '&:not([data-disabled])': theme.fn.hover({
            backgroundColor: 'rgba(21, 250, 38, 0.7)',
          }),
       // height:'96px',

        fontWeight:400,


        

    },
    diable:{
        border: '1px solid rgba(12, 219, 4, 1)',
        color:' rgba(19, 0, 242, 1)',
        background:'rgba(246, 245, 255, 0.78)',
        '&:not([data-disabled])': theme.fn.hover({
            backgroundColor: 'rgba(246, 245, 255, 0.78)',
          }),
       // height:'96px',

        fontWeight:400,


        

    },
    selected:{
        border: '1px solid rgba(19, 0, 242, 1)',
        color:' rgba(19, 0, 242, 1)',
        background:'#F6F5FF',
        '&:not([data-disabled])': theme.fn.hover({
            backgroundColor: '#F6F5FF',
          }),
       // height:'96px',

        fontWeight:400,

    }



    
}))

function Trade (){
    const context = useWeb3React()
    const connectWallet = async() =>{
        console.log(222)
        try {
			await context.activate(injected);
		} catch (ex) {
			console.log(ex);
		}
    }
    const { chainId, account,library, error: loginError } = context
    console.log(account,chainId)
    const { classes, cx } = useStyles();
    const [paid, setPaid] = useState(false);
    const [select, setSelect] = useState("CALL")



    function buy(){
        setPaid(!paid)
    }
    return (
        <Header>
           
            <Group position='right'>
                <div style={{width:'28%'}}>
                
                <BackgroundImage
                
                src={time}
                style={{ display:'flex',justifyContent:'center',width:'300px',backgroundSize: 'contain',backgroundRepeat: 'no-repeat'}}
                
               // style={{width:'300px',height:'100px'}}
                
                >
                    <div className={classes.countDown}> 03:02:01</div>
                </BackgroundImage>
             
                </div>
                
            </Group>
            <Group position='left'>
                
                
                <div style={{width:'72'}}>
                <div>111</div>
                <Flex direction={'column'}>
                    
                        <Text c='#fff' fz={20}>Current Price</Text>
                        <Title c='#fff' order={4}>1650.00</Title>

                        <Text c='#fff' fz={20}>04:15pm</Text>
                    </Flex>
                
                
             
                </div>
                
            </Group>
            
            <Grid columns={12} grow style={{width:'100%'}} className={paid ?classes.disable : classes.pannel}  justify='center'>
                
                <Grid.Col span={2} p="0" >
                <Flex direction={'column'} 
                    gap="xl"
                    justify="center"
                    align="center"
                    >
                    <Flex direction={'column'} 
                    >
                        <Text c='#1300F2' fz={20}>Exercise Date</Text>
                        <Text c='#07005C' fz={20}>Mar 1 9:50 PM</Text>
                    </Flex>
                    <Flex direction={'column'}>
                        <Text c='#1300F2' fz={20}>Asset</Text>
                        <Text c='#07005C' fz={20}>ETH</Text>
                    </Flex>
                    </Flex>
                </Grid.Col>
                <Grid.Col span={2} p="0" >
                <Flex direction={'column'} 
                    gap="xl"
                    justify="center"
                    align="center"
                    >
                    <Flex direction={'column'}>
                        <Text c='#1300F2' fz={20}>Strategy</Text>
                        <Flex><Button classNames={{root:  select === "CALL" ? classes.selected : classes.root}} size='md' radius="md" onClick={()=>{setSelect('CALL')}}>CALL</Button> 
                        <Button  classNames={{root: select === "PUT" ? classes.selected : classes.root}} size='md' radius="md" onClick={()=>{setSelect('PUT')}}>PUT</Button></Flex>
                    </Flex>
                    </Flex>
                </Grid.Col>
                <Grid.Col span={2} p="0" >
                <Flex direction={'column'} 
                    gap="xl"
                    justify="center"
                    align="center"
                    >
                    <Flex direction={'column'}>
                        <Text c='#1300F2' fz={20}>Strike Prices</Text>
                        <Text c='#07005C' fz={20}>$1,649</Text>
                    </Flex>
                    <Flex direction={'column'}>
                        <Text c='#1300F2' fz={20}>Enter Amount</Text>
                        <Text c='#07005C' fz={20}>2</Text>
                    </Flex>
                    </Flex>
                </Grid.Col>
                <Grid.Col span={2} p="0" >
                <Flex direction={'column'} 
                    gap="xl"
                    justify="center"
                    align="center"
                    >
                    <Flex direction={'column'}>
                        <Text c='#1300F2' fz={20}>Option Price</Text>
                        <Text c='#07005C' fz={20}>$1,647</Text>
                    </Flex>
                    <Flex direction={'column'}>
                        <Text c='#1300F2' fz={20}>Total Cost</Text>
                        <Text c='#07005C' fz={20}>$1,647</Text>
                    </Flex>
                    </Flex>
                </Grid.Col>
                <Grid.Col span={2} p="0" >
                    <Button classNames={{root: paid ? classes.diable : classes.confirm}} size='md' radius="md" onClick={buy}>Confirm</Button>

                </Grid.Col>
                
                <Grid.Col span={2} p="0"  style={{borderLeft: paid? '1px solid rgba(7, 0, 92, 0.16)' : '1px solid #07005C'}}>
                <Flex direction={'column'} 
                    gap="xl"
                    justify="center"
                    align="center"
                    h='35vh'
                    >
                    <Flex direction={'column'}>
                    
                        <Text c='#1300F2' fz={20}>Balance</Text>
                        <Text c='#07005C' fz={20}>$1,647</Text>
                    </Flex>
                    {
                    account !== undefined ? 
                        (
                  // @ts-ignore
                        <Button classNames={{root: classes.root}} size='md' radius="md"  onClick={connectWallet}>Disconnect</Button> 
                         
                        )
  // @ts-ignore
                       : <Button classNames={{root: classes.root}} size='md' radius="md" onClick={connectWallet} >Wallet</Button> 
                       
                        }
                    


                    </Flex>    
                </Grid.Col>
               
            </Grid>
            
        </Header>
    )
}

export default Trade