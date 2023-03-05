import { useWeb3React } from "@web3-react/core";
import { useRequest } from "ahooks";
import { ContractCallContext, Multicall } from "ethereum-multicall";
import { ethers } from "ethers";
import { useCallback, useEffect, useMemo } from "react";
import { ticket } from "../config";
import ticketAbi from "../config/1155.json";

// 0 - 1; 1 - 10; 2 - 25; 3 - 50
let ids: any = {
  CALL_6h_0: "",
  CALL_6h_1: "",
  CALL_6h_2: "",
  CALL_6h_3: "",

  CALL_12h_0: "",
  CALL_12h_1: "",
  CALL_12h_2: "",
  CALL_12h_3: "",

  CALL_24h_0:
    "40728909472521255286506899922282092804803978264293273496663147126521120096074",
  CALL_24h_1:
    "93219271127935074348546125057723077769600842658044489989817378402903718172102",
  CALL_24h_2:
    "109442464068786308949155354528402935161211828757017086602274310662552240009146",
  CALL_24h_3:
    "89103037616602743932351234104877047950166719436394661529187004062474099500533",

  PUT_6h_0: "",
  PUT_6h_1: "",
  PUT_6h_2: "",
  PUT_6h_3: "",

  PUT_12h_0: "",
  PUT_12h_1: "",
  PUT_12h_2: "",
  PUT_12h_3: "",

  PUT_24h_0:
    "11478133871468827022415012379347298944016004375369200109446065809397691192728",
  PUT_24h_1:
    "69647983905674016438041508081077278562463317895837305533691380204168314379743",
  PUT_24h_2:
    "92841096051317255686854774324245619150270374547430113608026718273304263757117",
  PUT_24h_3:
    "19531873269567616644244137852328005870206682629102350706506919455088698278584",
};

// 剔除空项
// ids = Object.keys(ids).filter((i: any)=>!!ids[i]).map(i=>({[i]: ids[i]}))

const useMyPosition = () => {
  const { account } = useWeb3React();

  const {
    run: multiCallOptionInfoRun,
    data: multiCallOptionInfoData,
  }: any = useRequest((account) => multiCallOptionInfo(account), {
    manual: true,
  });

  const multiCallOptionInfo = useCallback(async (account: any) => {
    const { ethereum } = window as any;

    const provider = new ethers.providers.Web3Provider(ethereum);
    //const multiCallProvider = new Provider(provider, cid);
    const multicall = new Multicall({
      ethersProvider: provider,
      tryAggregate: true,
    });

    const contractCallContext: ContractCallContext[] = [
      {
        reference: "ticket",
        contractAddress: ticket,
        abi: ticketAbi,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [account, ids["CALL_24h_3"]],
          },
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [account, ids["PUT_24h_3"]],
          },
        ],
      },
    ];

    try {
      const multiCallResult = await multicall.call(contractCallContext);
      return multiCallResult;
    } catch (e) {
      console.log("e", e);
    }
  }, []);

  useEffect(() => {
    if (account) {
      multiCallOptionInfoRun(account);
    }
  }, [account]);

  const balances = useMemo(() => {
    if (!multiCallOptionInfoData) return {
        CALL: null,
        PUT: null
    };

    const CALL_24h_2 = ethers.BigNumber.from(
      multiCallOptionInfoData?.results?.ticket?.callsReturnContext[0]
        ?.returnValues[0]
    ).toString();
    const PUT_24h_2 = ethers.BigNumber.from(
      multiCallOptionInfoData?.results?.ticket?.callsReturnContext[1]
        ?.returnValues[0]
    ).toString();

    const balances: any = {
      CALL: {
        CALL_24h_2,
        id: ids['CALL_24h_2']
      },
      PUT: {
        PUT_24h_2,
        id: ids['PUT_24h_2']
      },
    };

    return balances;
  }, [multiCallOptionInfoData]);

  return balances;
};
export default useMyPosition;
