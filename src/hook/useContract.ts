
import { Contract } from '@ethersproject/contracts';
import { useMemo } from 'react';

import { getContract } from '../utils';
import { useActiveWeb3React } from './index';
 import USDT_ABI from '../config/USDC.json';
 import option from '../config/option.json';
import { stringify } from 'querystring';

// returns null on errors
export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}


export function useOptionContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, option, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, USDT_ABI, withSignerIfPossible)
}

/*export function use721TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC_721_BASIC_ABI, withSignerIfPossible)
}

export function use1155TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC_1155_BASIC_ABI, withSignerIfPossible)
}

export async function erc721safeTransfer(tokenAddress: string , library?:any, account?:any, recipient?:string, id?:string, withSignerIfPossible=true){
  const contract = getContract(tokenAddress, ERC_721_BASIC_ABI, library, withSignerIfPossible && account ? account : undefined)
  return contract["safeTransferFrom(address,address,uint256)"](account, recipient, id);
}

export async function erc1155safeTransfer(tokenAddress: string , library?:any, account?:any, recipient?:string, id?:string, withSignerIfPossible=true){
  console.log('data',tokenAddress, ERC_1155_BASIC_ABI,library, account)
  const contract = getContract(tokenAddress, ERC_1155_BASIC_ABI, library, withSignerIfPossible && account ? account : undefined)
  return contract.safeTransferFrom(account, recipient, id, 1,[]);
}

*/

