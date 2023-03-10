import {
  BackgroundImage,
  Button,
  createStyles,
  Flex,
  Grid,
  Group,
  NumberInput,
  Space,
  Text
} from "@mantine/core";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import { useWeb3React } from "@web3-react/core";
import { useCountDown, useRequest } from "ahooks";
import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useNavigate } from "react-router-dom";
import time from "../assets/images/time.png";
import Header from "../compoments/header";
import { option, usdt } from "../config";
import optionAbi from "../config/optino.json";
import usdtAbi from "../config/USDC.json";
import { injected } from "../connectors";
import { useOptionContract, useTokenContract } from "../hook/useContract";
import { checkExpires, simplifyStr } from "../utils";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { ContractCallContext, Multicall } from "ethereum-multicall";
import eth from "../assets/images/eth.png";
import line from "../assets/images/line.png";
// import Trend from "../compoments/trend";
import BigNumber from "bignumber.js";
import { Options } from "../App";
import Trend from "../compoments/trendV2";
// import useKLine from "../hook/useKline";
import useKLine from "../hook/useKline-okex";
import useMyPosition from "../hook/useMyPosition";

const onlyMax = true;

const maxAllowance =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USD_DECIMALS = 30;
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(timezone)
dayjs.extend(utc);

const useStyles = createStyles((theme) => ({
  back: {
    backgroundImage: `url(../assets/images/back1.png) cover`,
  },
  textInputRoot: {
    width: "80%",
    borderBottom: "1px solid #000",
  },
  textInput: {
    background: "transparent",
    fontSize: "1.25rem",
    lineHeight: 1.55,
    width: "calc(100% - 38px)",
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
    position: "absolute",
    right: "60px",
    top: "0px",
  },
  countDown: {
    width: "220px",
    height: "60px",
    marginTop: "24px",
    marginBottom: "24px",
    backgroundColor: "rgba(242, 0, 177, 1)",
    color: "rgba(246, 245, 255, 1)",

    verticalAlign: "center",
    fontFamily:'TestS??hne-Fett',

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
  wrapper: {
    borderBottom: "1px solid #07005C",
    fontSize: "20px",
  },
  rightSection: {
    right: "20px",
  },
  input: {
    fontSize: "20px",
  },
}));

const testTime = 1677858179002;

function Trade() {
  const context = useWeb3React();
  const connectWallet = async () => {
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
  const [optionPrice, setOptionPrice] = useState(0);
  const [optionAdd, setOptionAdd] = useState("");
  const [info, setInfo] = useState<any>(null);
  const [expiry, setExpiry] = useState<any>();
  const [strikePrice, setStrikePrice] = useState(0);
  const [inputAmount, setInputAmount] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const optionProvider: any = useContext(Options);

  const getIndexPrice = () => {
    return fetch(`https://gmx-server-mainnet.uw.r.appspot.com/prices`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
    });
  };

  const {
    data: gmxIndexPrice,
    loading: indexPricLoading,
    run: queryIndexPrice,
  } = useRequest(() => getIndexPrice(), {
    pollingInterval: 10000,
    manual: true,
    //  refreshDeps: [account]
  });

  const handleIndex = useCallback(async () => {
    // console.log('getOptionsRes', getOptionsRes, getOptionsRes?.status, getOptionsRes?.body)

    const resText: any = await gmxIndexPrice?.text();
    const response = JSON.parse(resText);
    console.log("response", response);
    let httpCode = gmxIndexPrice?.status;
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
  }, [gmxIndexPrice]);

  useEffect(() => {
    if (gmxIndexPrice) {
      handleIndex();
    }
  }, [gmxIndexPrice]);

  const endT = dayjs.unix(expiry);
  const startT = dayjs();
  const diff = endT.diff(startT); // ?????????

  const [, formattedRes] = useCountDown({
    leftTime: diff,
  });
  const { hours, minutes, seconds } = formattedRes;

  const Hours = !hours ? "00" : hours < 10 ? "0" + hours : hours.toString();
  const Minutes = !minutes
    ? "00"
    : minutes < 10
    ? "0" + minutes
    : minutes.toString();
  const Seconds = !seconds
    ? "00"
    : seconds < 10
    ? "0" + seconds
    : seconds.toString();

  // contract

  const multiCallOptionInfo = async (account: any, timeset: number = 0) => {
    const { ethereum } = window as any;

    const provider = new ethers.providers.Web3Provider(ethereum);
    //const multiCallProvider = new Provider(provider, cid);
    const multicall = new Multicall({
      ethersProvider: provider,
      tryAggregate: true,
    });
    const contractCallContext: ContractCallContext[] = [
      {
        reference: "optino",
        contractAddress: option,
        abi: optionAbi,
        calls: [
          {
            reference: "OptionCollection",
            methodName: "OptionCollection",
            methodParameters: [],
          },
          {
            reference: "calls",
            methodName: "calls",
            methodParameters: [0],
          },
          {
            reference: "calls",
            methodName: "calls",
            methodParameters: [1],
          },
          {
            reference: "calls",
            methodName: "calls",
            methodParameters: [2],
          },
          {
            reference: "puts",
            methodName: "puts",
            methodParameters: [0],
          },
          {
            reference: "puts",
            methodName: "puts",
            methodParameters: [1],
          },
          {
            reference: "puts",
            methodName: "puts",
            methodParameters: [2],
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
            methodParameters: [account, option],
          },
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [account],
          },
        ],
      },
    ];

    setLoading(true);
    const multiCallResult = await multicall.call(contractCallContext);

    let add =
      multiCallResult.results.optino.callsReturnContext[0].returnValues[0];
    let usdcAllowence =
      multiCallResult.results.usdc.callsReturnContext[0].returnValues[0];
    let usdcBalance =
      multiCallResult.results.usdc.callsReturnContext[1].returnValues[0];
    
    const allLevelsCallList = multiCallResult.results.optino.callsReturnContext
      .slice(1, 1 + 3)
      ?.map((i) => i?.returnValues);
    const allLevelsPutList = multiCallResult.results.optino.callsReturnContext
      .slice(4, 4 + 3)
      ?.map((i) => i?.returnValues);

    let callList: any = [];
    let putList: any = [];

    if (onlyMax) {
      callList = allLevelsCallList.slice(-1)[0];
      putList = allLevelsPutList.slice(-1)[0];
    } else {
      callList = checkExpires(allLevelsCallList) || [];
      putList = checkExpires(allLevelsPutList) || [];
    }
   
    optionProvider.setOptions({
      CALL: allLevelsCallList,
      PUT: allLevelsPutList,
    });

    // let callList = multiCallResult.results.optino.callsReturnContext[1].returnValues
    // let putList = multiCallResult.results.optino.callsReturnContext[2].returnValues

    setOptionAdd(ethers.BigNumber.from(add).toString());
    // console.log( callList,'call')
    let res = callList.map((item: any) => {
      // console.log(ethers.BigNumber.from(item).toString())
      return ethers.BigNumber.from(item).toString();
    });
    let putRes = putList.map((item: any) => {
      //  console.log(ethers.BigNumber.from(item).toString())
      return ethers.BigNumber.from(item).toString();
    });

    console.log(res, putRes)

    setInfo({ CALL: res, PUT: putRes });
    setExpiry(Number(res[0]));

     console.log(dayjs(Number(res[0])).tz("America/New_York"),999)

    setUSDCAllowance(
      Number(formatUnits(ethers.BigNumber.from(usdcAllowence).toString(), 18))
    );
    setBalance(
      Number(formatUnits(ethers.BigNumber.from(usdcBalance).toString(), 18))
    );
    setLoading(false);
  };

  const multiOptionPrice = useCallback(
    async (expiry: any, strike: number, iscall: boolean) => {
      const { ethereum } = window as any;

      const provider = new ethers.providers.Web3Provider(ethereum);
      //const multiCallProvider = new Provider(provider, cid);
      const multicall = new Multicall({
        ethersProvider: provider,
        tryAggregate: true,
      });
      const contractCallContext: ContractCallContext[] = [
        {
          reference: "optino",
          contractAddress: option,
          abi: optionAbi,
          calls: [
            {
              reference: "price",
              methodName: "getPrice",
              methodParameters: [expiry, strike, iscall],
            },
          ],
        },
      ];
      const multiCallResult = await multicall.call(contractCallContext);

      let price =
        multiCallResult.results.optino.callsReturnContext[0].returnValues[0];
      //formatUnits(ethers.BigNumber.from(multiCallRes[1].returnValues[0]).toString(), 8)

      // console.log(formatUnits(ethers.BigNumber.from(price).toString(),18))
      setOptionPrice(
        Number(formatUnits(ethers.BigNumber.from(price).toString(), 18))
      );

      console.log(multiCallResult, "res");
    },
    []
  );

  const {
    run: multiCallOptionInfoRun,
    cancel: multiCallOptionInfoCancel,
  } = useRequest((account, timeset) => multiCallOptionInfo(account, timeset), {
    pollingInterval: 50000,
    manual: true,
  });

  useEffect(() => {
    if (account) {
      multiCallOptionInfoRun(account, 2);
    } else {
      setBalance(0);
    }
  }, [account]);

  const { run: multiOptionPriceRun } = useRequest(
    (expiry, strikePrice, select) =>
      multiOptionPrice(expiry, strikePrice, select === "CALL"),
    {
      pollingInterval: 5000,
      manual: true,
    }
  );

  useEffect(() => {
    if (expiry && select && strikePrice) {
      multiOptionPriceRun(expiry, strikePrice, select);
    }
  }, [expiry, select, strikePrice]);

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

  const traderBuy = async () => {
    if (!account) {
      connectWallet();
      return;
    }

    setLoading(true);
    try {
      if (!USDCAllowance) {
        const res = await approve();
        //@ts-ignore
        const _res = await res.wait();
        console.log("approve res ", _res);
        // setApproveLoading(false)
      }
      const params = [expiry, strikePrice, inputAmount, select === "CALL"];
      console.table(params);
      const res = await Optimistic?.buyOption(...params);
      const _res = await res.wait();
      let { status, transactionHash } = _res;
      console.log("_res", _res);
      if (status) {
        console.log(
          expiry,
          strikePrice,
          inputAmount,
          select === "CALL",
          "buy config"
        );
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
      setLoading(false);
    } catch (e) {
      console.log("err", e);
      // @ts-ignore
      let { code, action, reason } = e;
      showNotification({
        title: code ? `${code.replace(/_/g, " ")} ` : "Notification",
        message: reason ? `${reason} ????` : "Request is Failed.",
        icon: <IconX />,
        autoClose: 3600,
        color: "red",
      });
      setLoading(false);
    }
  };

  const curSelectedInfo = useMemo(() => (info ? info[select] : null), [
    info,
    select,
  ]);

  useEffect(() => {
    if (curSelectedInfo) {
      //@ts-ignore
      setStrikePrice(Number(curSelectedInfo[curSelectedInfo.length - 1]));
    }
  }, [curSelectedInfo]);

  const balances = useMyPosition();

  const { data }: any = useKLine();
  const indexPrice = useMemo(() => {
    if (!data) return "-";
    return BigNumber(data?.slice(-1)[0]?.value).toFixed(2);
  }, [data]);

  const handleExercise = () => {
    // exerciseRun(balances[select]?.id, balances[select][`${select}_24h_2`])
    if(!indexPrice) return ;
    if (BigNumber(indexPrice).gt(strikePrice)) {
      if (select === "CALL") {
        navigate(`/result/success?strikePrice=${strikePrice}&indexPrice=${indexPrice}`);
      } else {
        navigate(`/result/fail?strikePrice=${strikePrice}&indexPrice=${indexPrice}`);
      }
    }else{
      if (select === "PUT") {
        navigate(`/result/success?strikePrice=${strikePrice}&indexPrice=${indexPrice}`);
      } else {
        navigate(`/result/fail?strikePrice=${strikePrice}&indexPrice=${indexPrice}`);
      }
    }
  };

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

      <Group position="left" style={{ display: "flex", flexWrap: "nowrap" }}>
        <Group
          style={{
            padding: "20px",
            minWidth: "867px",
            width: "74%",
            height: "50vh",
            justifyContent: "flex-start",
          }}
          position="right"
        >
          {/* <Trend data={data} factor={0.8} /> */}
          <Trend strikePrices={info} data={data} />
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
            <div style={{height:'25vh'}}>
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Exercise Date
            </Text>
            <Text c="#07005C" fz={20}>
              {dayjs(expiry * 1000).tz("America/New_York").format("HH:mm:ss")}
            </Text>
          </Flex>
          <Space h="xl" />
          <Space h="xl" />

          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Asset
            </Text>
            <Text c="#07005C" fz={20}>
              <img
                src={eth}
                width={14}
                alt="eth logo"
                style={{ marginRight: "5px" }}
              />
              ETH
            </Text>
          </Flex>
          </div>
        </Grid.Col>
        <Grid.Col span={2} p="0">
        <div style={{height:'25vh'}}>
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
            {balances[select] ? (
              <>
                <Space h="sm" />
                <Text color={"rgba(0,0,0,0.4)"}>
                  Current Hold: {balances[select][`${select}_24h_2`]}
                </Text>
              </>
            ) : null}
          </Flex>
          <Flex direction={"column"} style={{ color: "transparent" }}>
            <Text c="transparent" fz={20}>
              trans
            </Text>
            <Text c="transparent" fz={20}>
              trans
            </Text>
          </Flex>
          </div>
        </Grid.Col>
        <Grid.Col span={2} p="0">
        <div style={{height:'25vh'}}>
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Strike Prices
            </Text>
            <Text c="#07005C" fz={20}>
              {/** @ts-ignore */}$ {strikePrice}
            </Text>
          </Flex>
          <Space h="xl" />
          <Space h="xl" />
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Enter Amount
            </Text>
            <Text c="#07005C" fz={20}></Text>
            <NumberInput
              variant="unstyled"
              placeholder="0"
              classNames={{
                wrapper: classes.wrapper,
                rightSection: classes.rightSection,
                input: classes.input,
              }}
              value={inputAmount}
              onChange={(val: any) => setInputAmount(val)}
              rightSection={select === "CALL" ? "Calls" : "Puts"}
              w="75%"
            ></NumberInput>
          </Flex>
          </div>
        </Grid.Col>
        <Grid.Col span={2} p="0">
        <div style={{height:'25vh'}}>
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Option Price
            </Text>
            <Text c="#07005C" fz={20}>
              ${optionPrice}
            </Text>
          </Flex>
          <Space h="xl" />
          <Space h="xl" />
          <Flex direction={"column"}>
            <Text c="#1300F2" fz={20}>
              Total Cost
            </Text>
            <Text c="#07005C" fz={20}>
              ${inputAmount * optionPrice}
            </Text>
          </Flex>
          </div>
        </Grid.Col>
        <Grid.Col span={2} p="0">
        <div style={{height:'25vh'}}>

 
          <Button
            classNames={{ root: paid ? classes.diable : classes.confirm }}
            size="md"
            radius="md"
            onClick={traderBuy}
            loading={loading}
            disabled={!inputAmount || !Number(inputAmount)}
          >
            {!account ? "Connect" : !USDCAllowance ? "Approve" : "Confirm"}
          </Button>
          <Space h="xl" />
          <Space h="xl" />
          <Space h="xl" />
          
          <Button
            classNames={{ root: paid ? classes.diable : classes.confirm }}
            size="md"
            radius="md"
           
            // loading={exerciseLoading}
            onClick={handleExercise}
            disabled={!indexPrice || !account}
          >
            Exercise
          </Button>
          </div>
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
        <Group p='0'>
          <div style={{height:'35vh',width:0,
        }}></div>

        <div style={{height:'24vh',margin:'0 auto'}}>
        <Flex direction={"column"}>
             <Text c="#1300F2" fz={20} >
                Balance
              </Text>
              <Text c="#07005C" fz={20}>
                ${balance}
              </Text>
          </Flex>
          <Space h="xl" />
          <Space h="xl" />
          <Flex direction={"column"}>
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
          </div>
          </Group>
        </Grid.Col>
      </Grid>
    </Header>
  );
}

export default Trade;
