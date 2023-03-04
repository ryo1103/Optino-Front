import {
    BackgroundImage, Button, createStyles, Flex, Grid, Group, Space, Text
} from "@mantine/core";
import { useCallback, useEffect, useState } from "react";

import { formatEther } from "@ethersproject/units";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import { useWeb3React } from "@web3-react/core";
import { useCountDown, useRequest } from "ahooks";
import { formatUnits } from "ethers/lib/utils";
import time from "../assets/images/time.png";
import Header from "../compoments/header";
import { option, usdt } from "../config";
import { injected } from "../connectors";
import {
    useOptionContract, useTokenContract
} from "../hook/useContract";
import { simplifyStr } from "../utils";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import line from "../assets/images/line.png";
import Trend from "../compoments/trend";
import useHistoryData from "../hook/useHistoryData";

const maxAllowance =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USD_DECIMALS = 30;
dayjs.extend(relativeTime);
dayjs.extend(duration);

const useStyles = createStyles((theme) => ({
  back: {
    backgroundImage: `url(../assets/images/back1.png) cover`,
  },
  pannel: {
    border: "1px solid #07005C",
    background: "#E6EBEB",
    margin: 0,
    height: "35vh",
    flexDirection: "row",
    padding: "0 60px",
    alignItems: "center",
    position: "fixed",
    bottom: 0,
  },
  disable: {
    border: "1px solid rgba(7, 0, 92, 0.16)",
    background: "rgba(21, 250, 38, 0.07)",
    margin: 0,
    height: "35vh",
    flexDirection: "row",
    padding: "0 60px",
    alignItems: "center",
    position: "fixed",
    bottom: 0,
  },
  countDownContainer: {
    position: 'absolute',  
    right: '60px',
    top: '0px'
  },
  countDown: {
    width: "220px",
    height: "60px",
    marginTop: "24px",
    marginBottom: "24px",
    backgroundColor: "rgba(242, 0, 177, 1)",
    color: "rgba(246, 245, 255, 1)",

    verticalAlign: "center",

    lineHeight: "60px",
    paddingLeft: "20px",
    fontSize: "36px",
    borderRadius: "8px",
    border: "1px solid rgba(246, 245, 255, 1)",
    opacity: 0.88,
  },
  root: {
    border: "0.5px solid #707070",
    color: "#07005C",
    background: "rgba(255,255,255,0.3)",
    "&:not([data-disabled])": theme.fn.hover({
      backgroundColor: "rgba(255,255,255,0.7)",
    }),
    // height:'96px',

    fontWeight: 400,
  },
  confirm: {
    border: "1px solid rgba(12, 219, 4, 1)",
    color: "rgba(7, 0, 92, 1)",
    background: "rgba(21, 250, 38, 0.3)",
    "&:not([data-disabled])": theme.fn.hover({
      backgroundColor: "rgba(21, 250, 38, 0.7)",
    }),
    // height:'96px',

    fontWeight: 400,
  },
  diable: {
    border: "1px solid rgba(12, 219, 4, 1)",
    color: " rgba(19, 0, 242, 1)",
    background: "rgba(246, 245, 255, 0.78)",
    "&:not([data-disabled])": theme.fn.hover({
      backgroundColor: "rgba(246, 245, 255, 0.78)",
    }),
    // height:'96px',

    fontWeight: 400,
  },
  selected: {
    border: "1px solid rgba(19, 0, 242, 1)",
    color: " rgba(19, 0, 242, 1)",
    background: "#F6F5FF",
    "&:not([data-disabled])": theme.fn.hover({
      backgroundColor: "#F6F5FF",
    }),
    // height:'96px',

    fontWeight: 400,
  },
  line: {
    "::after": {
      content: `"1"`,
      position: "absolute",
      background: `url(${line})`,
      backgroundSize: "contain",
      width: "70vw",
      hight: "100vh",
      color: "transparent",
    },
  },
}));

const testTime = 1677858179002;

const endT = dayjs.unix(testTime);
const startT = dayjs();
const diff = endT.diff(startT); // 时间差

function Trade() {
  const context = useWeb3React();
  const connectWallet = async () => {
    console.log(222);
    try {
      await context.activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  };
  const { chainId, account, library, error: loginError } = context;
  const { classes, cx } = useStyles();
  const [paid, setPaid] = useState(false);
  const [select, setSelect] = useState("CALL");
  const [index, setIndex] = useState<any>(0);
  const [balance, setBalance] = useState<any>(0);
  const tokenContract = useTokenContract(usdt);
  const Optimistic = useOptionContract(option);
  const [USDCAllowance, setUSDCAllowance] = useState(0);
  const [optionPrice, setOptionPrice] = useState(0.75);

  //console.log('!!!', Optimistic)

  const getIndexPrice = () => {
    return fetch(`https://gmx-server-mainnet.uw.r.appspot.com/prices`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
    });
  };

  const {
    data: indexPrice,
    loading: indexPricLoading,
    run: queryIndexPrice,
  } = useRequest(() => getIndexPrice(), {
    pollingInterval: 10000,
    manual: true,
    //  refreshDeps: [account]
  });

  useEffect(() => {
    // console.log('!!!',period)
    queryIndexPrice();
  }, []);

  const handleIndex = useCallback(async () => {
    // console.log('getOptionsRes', getOptionsRes, getOptionsRes?.status, getOptionsRes?.body)

    const resText: any = await indexPrice?.text();
    const response = JSON.parse(resText);
    let httpCode = indexPrice?.status;
    if (httpCode === 200) {
      // const result = response.result;
      //('price data', response)

      // let prices = response?.prices;
      // weth address
      // console.log('index price', formatUnits(response[WETH],USD_DECIMALS))
      try {
        setIndex(formatUnits(response[WETH], USD_DECIMALS));
      } catch (e) {
        console.log("get index price err", e);
      }
    }
  }, [indexPrice]);

  useEffect(() => {
    if (indexPrice) {
      handleIndex();
    }
  }, [indexPrice]);



  const [countdown, formattedRes] = useCountDown({
    targetDate: diff,
  });
  const { hours, minutes, seconds } = formattedRes;

  const Hours = hours < 10 ? "0" + hours : hours.toString();
  const Minutes = minutes < 10 ? "0" + minutes : minutes.toString();
  const Seconds = seconds < 10 ? "0" + seconds : seconds.toString();

  // contract

  const {
    run: getBalance,
    data: getBalanceRes,
    error: getUserStakeError,
  } = useRequest(() => tokenContract?.balanceOf(account), {
    manual: true,
    refreshDeps: [account],
    pollingInterval: 5000,
    pollingWhenHidden: false,
  });

  const { run: getPrice, data: opPrice, error: opError } = useRequest(
    () => Optimistic?.balanceOf(account),
    {
      manual: true,
      refreshDeps: [account],
      pollingInterval: 5000,
      pollingWhenHidden: false,
    }
  );

  useEffect(() => {
    if (getBalanceRes) {
      // @ts-ignore
      // console.log('usdc Balance', getBalanceRes, formatEther(getBalanceRes))
      // @ts-ignore
      setBalance(formatEther(getBalanceRes));
      //  setBalance(getBalanceRes)
    }
  }, [getBalanceRes]);

  const {
    data: allowance,
    loading: allowanceLoading,
    cancel: cancelQueryAllowance,
    run: queryallowance,
  } = useRequest(() => tokenContract?.allowance(account, option), {
    pollingInterval: 5000,
    manual: true,
    refreshDeps: [account],
  });

  useEffect(() => {
    if (account) {
      queryallowance();
      getBalance();
    }
  }, [account]);

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

  useEffect(() => {
    if (allowance) {
      // console.log("allowance--", allowance)
      setUSDCAllowance(Number(allowance));
    }
  }, [allowance]);

  const traderBuy = async () => {
    try {
      if (!USDCAllowance) {
        const res = await approve();
        //@ts-ignore
        const _res = await res.wait();
        console.log("approve res ", _res);
        // setApproveLoading(false)
      }
      let amount = 50;

      const res = await Optimistic?.buyOption(23948, 1750, amount, true);
      const _res = await res.wait();
      let { status, transactionHash } = _res;
      console.log("_res", _res);
      if (status) {
        console.log(Number(amount).toFixed());
        setPaid(!paid);
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

  function buy() {
    setPaid(!paid);
  }


  const data = useHistoryData()

  return (
    <Header>
      <Group position="right" className={classes.countDownContainer}>
        <div>
          <BackgroundImage
            src={time}
            style={{
              display: "flex",
              justifyContent: "center",
              width: "300px",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}

            // style={{width:'300px',height:'100px'}}
          >
            <div className={classes.countDown}>
              {`${Hours}:${Minutes}:${Seconds}`}
            </div>
          </BackgroundImage>
        </div>
      </Group>
      
      <Group position="left" style={{display: 'flex', flexWrap: 'nowrap'}}>
        {/* <Group style={{ padding: "20px", width: "50%", height: "280px" }} position="right">
        <Trend data={data}/>
        </Group> */}
        <Group style={{ padding: "20px", minWidth: '867px', width: "100%", height: "70vh" }} position="right">
            <Trend data={data} factor={0.8}/>
        </Group>
        
      </Group>

      <Grid
        columns={12}
        grow
        style={{ width: "100%" }}
        className={paid ? classes.disable : classes.pannel}
        justify="center"
      >
        <Grid.Col span={2} p="0">
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Exercise Date
            </Text>
            <Text c="#07005C" fz={20}>
              Mar 1 9:50 PM
            </Text>
          </Flex>
          <Space h="xl" />

          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Asset
            </Text>
            <Text c="#07005C" fz={20}>
              ETH
            </Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={2} p="0">
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Strategy
            </Text>
            <Flex mt={5}>
              <Button
                classNames={{
                  root: select === "CALL" ? classes.selected : classes.root,
                }}
                size="md"
                radius="md"
                onClick={() => {
                  setSelect("CALL");
                }}
              >
                CALL
              </Button>
              <Button
                ml={8}
                classNames={{
                  root: select === "PUT" ? classes.selected : classes.root,
                }}
                size="md"
                radius="md"
                onClick={() => {
                  setSelect("PUT");
                }}
              >
                PUT
              </Button>
            </Flex>
          </Flex>
          <Flex direction={"column"} style={{ color: "transparent" }}>
            <Text c="transparent" fz={20}>
              trans
            </Text>
            <Text c="transparent" fz={20}>
              trans
            </Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={2} p="0">
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Strike Prices
            </Text>
            <Text c="#07005C" fz={20}>
              $1,649
            </Text>
          </Flex>
          <Space h="xl" />
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Enter Amount
            </Text>
            <Text c="#07005C" fz={20}>
              2
            </Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={2} p="0">
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Option Price
            </Text>
            <Text c="#07005C" fz={20}>
              ${optionPrice}
            </Text>
          </Flex>
          <Space h="xl" />
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Total Cost
            </Text>
            <Text c="#07005C" fz={20}>
              $1,647
            </Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={2} p="0">
          <Flex direction={"column"} style={{ color: "transparent" }}>
            <Text c="transparent" fz={20}>
              trans
            </Text>
            <Text c="transparent" fz={20}>
              trans
            </Text>
          </Flex>
          <Space h="xl" />
          <Button
            classNames={{ root: paid ? classes.diable : classes.confirm }}
            size="md"
            radius="md"
            onClick={traderBuy}
          >
            Confirm
          </Button>
        </Grid.Col>

        <Grid.Col
          span={2}
          p="0"
          style={{
            borderLeft: paid
              ? "1px solid rgba(7, 0, 92, 0.16)"
              : "1px solid #07005C",
          }}
        >
          <Flex
            direction={"column"}
            gap="xl"
            justify="center"
            align="center"
            h="35vh"
          >
            <Flex direction={"column"}>
              <Text c="#1300F2" fz={20}>
                Balance
              </Text>
              <Text c="#07005C" fz={20}>
                ${balance}
              </Text>
            </Flex>
            {account !== undefined ? (
              // @ts-ignore

              <Button
                classNames={{ root: classes.root }}
                size="md"
                radius="md"
                onClick={connectWallet}
              >
                Disconnect
              </Button>
            ) : (
              // @ts-ignore
              <Button
                classNames={{ root: classes.root }}
                size="md"
                radius="md"
                onClick={connectWallet}
              >
                Wallet
              </Button>
            )}

            {// @ts-ignore
            account !== undefined ? (
              <Text style={{ display: "block" }}>{simplifyStr(account)}</Text>
            ) : null}
          </Flex>
        </Grid.Col>
      </Grid>
    </Header>
  );
}

export default Trade;
