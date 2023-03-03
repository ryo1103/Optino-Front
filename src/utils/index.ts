import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
// @ts-ignore
import BigNumber from "bignumber.js";
import { option, LPShares, usdt} from '../config';
import lpAbi from '../config/lp.json'
import USDCAbi from '../config/USDC.json'
import optionAbi from '../config/option.json'



// import { ethers} from 'ethers';

export const million = 1000000;
export const thousand = 1000;
export const isImage = (contentType: string) => {
  return /^(image\/)/.test(contentType);
}

export const simplifyAddr = (address: string) => {
  const regex = /(\w{7})\w{31}(\w{4})/
  return address ? address.replace(regex, '$1...$2') : '';
}

export const compare = (A: string | number, B: string | number, symbol: string) => {
  switch (symbol) {
    case "lt":
      return new BigNumber(A).lt(B);
      break;
    case "gt":
      return new BigNumber(A).gt(B);
      break;
    case "lte":
      return new BigNumber(A).lte(B);
      break;
    case "gte":
      return new BigNumber(A).gte(B);
      break;
    case "eq":
      return new BigNumber(A).eq(B);
      break;
  }

}
/**
 * simplifyStr(str,{...})
 * 钱包地址/hash等字符串简化处理，大多数时候应该是不需要config参数
 * @param str :string,需要处理的字符串
 * @param config :类型以及说明见SimplifyStrConfig
 * @returns string 
 * eq:
 * simplifyStr("0xf2AdcfcC8c1A77F940cC93C909df6075591Ff28c"); //=>0xf2Ad...f28c   
 * simplifyStr("0xf2AdcfcC8c1A77F940cC93C909df6075591Ff28c",{ frontBeginIndex: 2, connectSymbol: "***" })//=>f2Adcf***f28c
 */
interface SimplifyStrConfig {
  frontBeginIndex?: number; //开始位置索引,默认值=0
  frontLength?: number; // 前面部分的长度,默认值=6
  endingLength?: number; // 后面部分的长度,默认值=4
  connectSymbol: string// 前后两部分的连接符号，,默认值="..."
}
export const simplifyStr = (str: string, config?: SimplifyStrConfig): string => {
  const defaultConfig = { frontBeginIndex: 0, frontLength: 6, connectSymbol: '...', endingLength: 4 };
  const { frontBeginIndex, frontLength, connectSymbol, endingLength } = { ...defaultConfig, ...config }
  return str ? `${str.substring(frontBeginIndex, frontBeginIndex + frontLength)}${connectSymbol}${str.substring(str.length - endingLength)}` : '-'
}

/**
 * numberConvert(n,dp)
 * 数字转换K、M单位
 * @param n : number | string 
 * @param dp :number, 小数位长度，默认值=1,小数位四舍五入 | dp = decimal places
 * @returns string
 */
export const numberConvert = (n: number | string, dp: number = 1): string => {
  const bigN = new BigNumber(n);
  if (bigN.eq(NaN)) {
    return "-";
  }
  if (bigN.gte(million)) {
    return bigN.div(million).dp(dp, 2).toFormat() + "M";
  } else if (bigN.lt(million) && bigN.gte(thousand)) {
    return bigN.div(thousand).dp(dp, 2).toFormat() + "K";
  } else {
    return bigN.dp(dp, 2).toFormat();
  }
}

/**
 * thousandthConvert(n,{dp,dpFixed})
 * 数字千分位转换，小数位长度限制
 * @param n :[number | string] 
 * @param dp :number, 小数位长度，默认值=2 ,小数位四舍五入 | dp = decimal places
 * @param dpFixed :boolean ,是否固定小数位长度，为false的时候小数位最后的0会被抹去，默认值=false
 * @returns string
 * eq:
 * thousandthConvert(123456789);//=>123,456,789
 * thousandthConvert(123456789.1003);//=>123,456,789.1
 * thousandthConvert(123456789.1003, { dp: 2, dpFixed: true });//=>123,456,789.10   固定小数长度,即使最后一位小数是0，也保留
 * thousandthConvert(123456789.1003, { dp: 2, dpFixed: false });//=>123,456,789.1   不固定小数长度,最后一位小数是0，抹去
 * thousandthConvert(123456789.1053, { dp: 2, dpFixed: false });//=>123,456,789.11  不固定小数长度,小数位四舍五入
 * thousandthConvert(123456789.126);//=>123,456,789.12
 * thousandthConvert(-123456789.126);//=>-123,456,789.12
 */
interface thousandthConvertConfig {
  dp?: number;
  dpFixed?: boolean;
}
export const thousandthConvert = (n: number | string, config?: thousandthConvertConfig): string => {
  const defaultConfig = { dp: 2, dpFixed: false }
  const { dp, dpFixed } = { ...defaultConfig, ...config };
  if (dpFixed) {
    return new BigNumber(n).toFormat(dp);
  } else {
    return new BigNumber(n).dp(dp, 4).toFormat();
  }
}


// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    // console.log('getAddress (value)', getAddress(value))
    return getAddress(value)
  } catch {
    return false
  }
}



// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}


// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export const getLiquidityPoolContract = (library: Web3Provider, account?: string): Contract => {
  return getContract(LPShares, lpAbi, library, account);
};

export const getOptionContract = (library: Web3Provider, account?: string, optionName?: string): Contract => {
  //@ts-ignore
  return getContract(traderList[optionName], traderAbi, library, account);
};

export const getOracleContract = (library: Web3Provider, account?: string ): Contract => {
  //@ts-ignore
  return getContract(oracle, oracleAbi, library, account);
};





/* export const getLPStakingPoolContract = (library: Web3Provider, account?: string): Contract => {
  return getContract(library, addresses.STAKING_POOL_FOR_LOOKS_LP, StakingPoolForUniswapV2TokensAbi, account);
}; */


/**
 * Reverse fromDecimals
 * @param value
 * @param decimals
 * @returns BigNumber
 */

// @ts-ignore
export const toDecimals = (value: string, decimals = 18) => {console.log(value); return ethers.utils.parseUnits(value, decimals);}

export const baseChainID = process.env.REACT_APP_ENV === 'MAIN' ? 43114 : 43113;

export const CHAIN_LIST = [
  {
    chainId: `0xa869`,// A 0x-prefixed hexadecimal chainId
    chainName: 'Avalanche FUJI C-Chain',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax-test.network']
  },
  {
    chainId: `0xa86a`,// A 0x-prefixed hexadecimal chainId
    chainName: 'Avalanche Mainnet C-Chain',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax.network/']
  },
  {
    chainId: `0x80`,// A 0x-prefixed hexadecimal chainId
    chainName: 'HECO',
    nativeCurrency: {
      name: 'HT',
      symbol: 'HT',
      decimals: 18
    },
    rpcUrls: ['https://http-mainnet.hecochain.com'],
  },
  {
    chainId: `0x100`,// A 0x-prefixed hexadecimal chainId
    chainName: 'HECO TEST',
    nativeCurrency: {
      name: 'HT',
      symbol: 'HT',
      decimals: 18
    },
    rpcUrls: ['https://http-testnet.hecochain.com'],
  },
  {
    chainId: `0x38`,// A 0x-prefixed hexadecimal chainId
    chainName: 'Binance Smart Chain Mainnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed1.ninicoin.io', 'https://bsc-dataseed2.ninicoin.io'],
    blockExplorerUrls: ['https://bscscan.com/']
  },
  {
    chainId: `0x61`,// A 0x-prefixed hexadecimal chainId
    chainName: 'Binance Smart Chain Mainnet TEST',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    blockExplorerUrls: ['https://bscscan.com/']
  }
]

