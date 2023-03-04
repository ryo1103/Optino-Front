import { Button, Text, Container, Group, Image, SegmentedControl, Grid, Divider, Space, createStyles, Select, Stack, Flex, Paper, Input, TextInput, Slider, Drawer, Title, Modal, Tooltip,Box, List,Mark} from '@mantine/core';
import { hover } from '@testing-library/user-event/dist/hover';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import { Multicall, ContractCallResults,ContractCallContext } from 'ethereum-multicall';
import { showNotification } from "@mantine/notifications";
import { option, usdt, LPShares} from "../config";
import optionAbi from "../config/optino.json"
import usdtAbi from "../config/USDC.json"
import { formatUnits } from "ethers/lib/utils";
import {  useRequest } from "ahooks";
import { IconCheck, IconX } from "@tabler/icons";
import { injected } from "../connectors";
import {
    useOptionContract, useTokenContract
} from "../hook/useContract";


import Header from '../compoments/header';
const useStyles = createStyles((theme) => ({
    root:{
        border: '0.5px solid #707070',
        color:'#07005C',
        background:'rgba(255,255,255,0.3)',
        '&:not([data-disabled])': theme.fn.hover({
            backgroundColor: 'rgba(255,255,255,0.7)',
          }),
       // height:'96px',
        fontSize:'24px',
        fontWeight:400,


        

    },
    inner:{
        marginRight:'25px'
    }
    
}))

 function Stake  (){
    const { classes, cx } = useStyles();
    const [stake, setStake] = useState(0);
    const [lpTokenPrice, useLpTokenPrice] = useState(0);
    const context = useWeb3React();
    const { chainId, account, library, error: loginError } = context;
    const [balance, setBalance] = useState(0)
    const [USDCAllowance, setUSDCAllowance] = useState(0)
    const [lpPrice, setLpPrice] = useState(0)
    const [totalStake, setTotalStake] = useState(0)
    const [canWithdraw, setCanWithdraw] = useState(0)
    const [depositAmount, setDepositAmount] = useState(10)
    const [withdrawAmount, setWithdrawAmount] = useState(10)
    const tokenContract = useTokenContract(usdt);
    const Optimistic = useOptionContract(option);
    const maxAllowance =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

    const connectWallet = async () => {
        console.log(222);
        try {
          await context.activate(injected);
        } catch (ex) {
          console.log(ex);
        }
      };


    const multiCallLPInfo = useCallback(async (account: any) => {
        const { ethereum } = window as any;
    
        const provider = new ethers.providers.Web3Provider(ethereum);
        //const multiCallProvider = new Provider(provider, cid);
        const multicall = new Multicall({
          ethersProvider: provider,
          tryAggregate: true,
        });
        const contractCallContext: ContractCallContext[] = [
          {
            reference: "LPShares",
            contractAddress: LPShares,
            abi: usdtAbi,
            calls: [
              {
                reference: "balanceOf",
                methodName: "balanceOf",
                methodParameters: [account],
              },
              {
                reference: "totalSupply",
                methodName: "totalSupply",
                methodParameters: [],
              },
            ],
          },
          {
            reference: "usdc",
            contractAddress: usdt,
            abi: usdtAbi,
            calls: [
              {
                reference: "allowance",
                methodName: "allowance",
                methodParameters: [account,option],
              },
              {
                reference: "balanceOf",
                methodName: "balanceOf",
                methodParameters: [account],
              },
            ],
          },
          {
            reference: "optino",
            contractAddress: option,
            abi: optionAbi ,
            calls: [
              {
                reference: "LPEquity",
                methodName: "LPEquity",
                methodParameters: [],
              }, 
              {
                reference: "liquidityAvailable",
                methodName: "liquidityAvailable",
                methodParameters: [],
   
              },
              {
                reference: "LPValueOfOptions",
                methodName: "LPValueOfOptions",
                methodParameters: [],
   
              }
       
            ],
          },
    
        ];
    
        const multiCallResult = await multicall.call(contractCallContext);
        let optino = multiCallResult.results.optino.callsReturnContext
        let lp = multiCallResult.results.LPShares.callsReturnContext
        let usdc  = multiCallResult.results.usdc.callsReturnContext
        let totalSupply = lp[1].returnValues[0] !== undefined ?  formatUnits( ethers.BigNumber.from(lp[1].returnValues[0]).toString(),18) :0
        let userLp =  lp[0].returnValues[0] !== undefined ? formatUnits( ethers.BigNumber.from(lp[0].returnValues[0]).toString(),18) :0
        let balanace =  usdc[1].returnValues[0] !== undefined ? formatUnits( ethers.BigNumber.from(usdc[1].returnValues[0]).toString(),18) :0
        let allowance =  usdc[0].returnValues[0] !== undefined ? formatUnits( ethers.BigNumber.from(usdc[0].returnValues[0]).toString(),18) : 0
        let lpEquity = optino[0].returnValues[0] !== undefined ? formatUnits( ethers.BigNumber.from(optino[0].returnValues[0]).toString(),18) :0
        let lpAvailable = optino[1].returnValues[0] !== undefined ? formatUnits( ethers.BigNumber.from(optino[1].returnValues[0]).toString(),18) :0

        console.log(totalSupply, userLp, balanace, allowance, lpAvailable , lpEquity)
        setTotalStake(Number(totalSupply))
        setBalance(Number(balanace))
        setStake(Number(userLp))
        setUSDCAllowance(Number(allowance))
        setCanWithdraw(Number(lpAvailable))
        let LPPrice = Number(lpEquity )=== 0 ? 1: Number(lpAvailable)/Number(lpEquity )
        setLpPrice(LPPrice)

        console.log(lp,lp[0],lp[1])

        
      /*  let add = multiCallResult.results.optino.callsReturnContext[0].returnValues[0]
        let callList = multiCallResult.results.optino.callsReturnContext[1].returnValues */

       // console.log(res, putRes)  
     //   setInfo({CALL:res, PUT:putRes})
     //   setExpiry(Number(res[0])* 1000)
       // console.log(dayjs(expiry).format())
    
        console.log(multiCallResult,'stake')
    

    
      //  setUSDCAllowance(Number(formatUnits( ethers.BigNumber.from(usdcAllowence).toString(),18)))
      //  setBalance(Number(formatUnits( ethers.BigNumber.from(usdcBalance).toString(),18)))
       
      }, []);


      const { run: multiCallLPInfoRun } = useRequest(
        (account) => multiCallLPInfo(account),
        {
          pollingInterval: 50000,
          manual: true,
        }
      );
    
    
    
      useEffect(() => {
        if (account) {
            multiCallLPInfoRun(account);
        } else {
          setBalance(0);
    
          //init();
        }
      }, [account, multiCallLPInfoRun]);

      //deposit

      const { runAsync: approve } = useRequest(
        () => tokenContract?.approve(option, maxAllowance),
        {
          manual: true,
          onError: (e) => {
            console.log("---e", e);
          },
          onFinally: (data) => {
            console.log("---data", data);
          },
        }
      );
    

      
    const deposit = async () => {
        try {
          if (!USDCAllowance) {
            const res = await approve();
            //@ts-ignore
            const _res = await res.wait();
            console.log("approve res ", _res);
            // setApproveLoading(false)
          }
          const res = await Optimistic?.liquidityDeposit(depositAmount);
          const _res = await res.wait();
          let { status, transactionHash } = _res;
          console.log("_res", _res);
          if (status) {
            //console.log(expiry,strikePrice, inputAmount, select==='CALL' , 'buy config');
          //  setPaid(!paid);
            showNotification({
              title: "Successfully",
              message: ``,
              icon: <IconCheck />,
              autoClose: 3600,
              color: "teal",
            });
            // setAmount('')
          }
        } catch (e) {
          console.log("err", e);
          // @ts-ignore
          let { code, action, reason } = e;
          showNotification({
            title: code ? `${code.replace(/_/g, " ")} ` : "Notification",
            message: reason ? `${reason} 🤥` : "Request is Failed.",
            icon: <IconX />,
            autoClose: 3600,
            color: "red",
          });
        }
      };

      const withdrawRequest = async () => {
        try {
          if (!USDCAllowance) {
            const res = await approve();
            //@ts-ignore
            const _res = await res.wait();
            console.log("approve res ", _res);
            // setApproveLoading(false)
          }
          const res = await Optimistic?.requestLiquidityWithdraw(withdrawAmount);
          const _res = await res.wait();
          let { status, transactionHash } = _res;
          console.log("_res", _res);
          if (status) {
            //console.log(expiry,strikePrice, inputAmount, select==='CALL' , 'buy config');
          //  setPaid(!paid);
            showNotification({
              title: "Successfully",
              message: ``,
              icon: <IconCheck />,
              autoClose: 3600,
              color: "teal",
            });
            // setAmount('')
          }
        } catch (e) {
          console.log("err", e);
          // @ts-ignore
          let { code, action, reason } = e;
          showNotification({
            title: code ? `${code.replace(/_/g, " ")} ` : "Notification",
            message: reason ? `${reason} 🤥` : "Request is Failed.",
            icon: <IconX />,
            autoClose: 3600,
            color: "red",
          });
        }
      };



    return (
        <Header>
            <Group align={'start'} position="apart" ml={120} mr={120} mt={90} >
                <Title  order={3} c='#07005C' fw={400}>Stake </Title>
                <Title  order={3} c='#07005C' fw={400}>{stake} </Title>
            </Group>
            <Group align={'start'} position="apart" ml={120} mr={120} mt={10} >
                <Title  order={3} c='#07005C' fw={400}> Total Stake</Title>
                <Title  order={3} c='#07005C' fw={400}>{totalStake} </Title>
            </Group>
            <Group align={'start'} position="apart" ml={120} mr={120} mt={10} >
                <Title  order={3} c='#07005C' fw={400}>LP Token Price</Title>
                <Title  order={3} c='#07005C' fw={400}>$ {lpPrice}</Title>
            </Group>
            
            <Group align={'start'} position="apart" ml={120} mr={120} mt={10} >
                <Title  order={3} c='#07005C' fw={400}>Spare funds</Title>
                <Title  order={3} c='#07005C' fw={400}>$ {canWithdraw}</Title>
            </Group>
           {/* <Group align={'start'} position="apart" ml={120} mr={120} mt={10} >
                <Title  order={3} c='#07005C' fw={400}>ARP</Title>
                <Title  order={3} c='#07005C' fw={400}>-- %</Title>
            </Group> */}


            <Group align={'start'} position="left" ml={120} mr={120}   mt={100}>
                <Button radius="md" classNames={{root:classes.root, inner:classes.inner}} size='xl' onClick={deposit}>Stake</Button>
                <Button radius="md" classNames={{root:classes.root, inner:classes.inner}} size='xl' ml={60} onClick={withdrawRequest}>Unstake</Button>

            {account !== undefined ? (
              // @ts-ignore

              <Button radius="md" classNames={{root:classes.root, inner:classes.inner}} size='xl' ml={60}
                onClick={connectWallet}
                >Disconnect</Button>
            ) : (
              // @ts-ignore
              <Button radius="md" classNames={{root:classes.root, inner:classes.inner}} size='xl' ml={60}
                onClick={connectWallet}
                >Wallet</Button>
            )}
            </Group>
            
        </Header>
    )
}

export default Stake