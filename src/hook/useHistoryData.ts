import { useMount, useRequest } from "ahooks";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

type MarketDataItem = {
  time: number;
  high: number;
  low: number;
  open: number;
  volumefrom: number;
  volumeto: number;
  close: number;
  conversionType: string;
  conversionSymbol: string;
};

type MarketData = Array<MarketDataItem>;

const getPriceFromExchange = async () => {
  try {
    const response = await fetch(
      window.location.protocol +
        "//" +
        window.location.hostname +
        ":3001" +
        `/api/getFullPrice`
    );
    const json = await response.json();
    console.log("json", json);
  } catch (e) {
    return new Error(`Failed to fetch`);
  }
};

const useHistoryData = () => {
  const [cuPrice, setCurPrice] = useState([]);
  const [curLen, setCurLen] = useState(30);
//   http://210.17.199.226:9000/api/trading/ticker/?instId=BTC-USDT
//   const getHistoryPrice = async () => {
//     const url = "http://210.17.199.226:9000/api/index-candles/ticker?instId=ETH-USDT";
//     // const limit = curLen; // 指定返回数据的数量为 30 条
//     // const aggregate = 1; // 指定时间间隔为 1 分钟
//     // const query = `fsym=${fsym}&tsym=${tsym}&limit=${limit}&aggregate=${aggregate}`;
//     try {
//       const response = await fetch(`${url}`);
//       const json = await response.json();
//       const result = json?.Data?.Data;

//       return result;
//     } catch (e) {
//       return new Error(`Failed to fetch`);
//     }
//   };

  const getHistoryPrice = async () => {
    const url = "https://min-api.cryptocompare.com/data/v2/histominute";
    const fsym = "ETH"; // 指定加密货币符号为 ETH
    const tsym = "USD"; // 指定比较货币符号为 USD
    const limit = curLen; // 指定返回数据的数量为 30 条
    const aggregate = 1; // 指定时间间隔为 1 分钟
    const query = `fsym=${fsym}&tsym=${tsym}&limit=${limit}&aggregate=${aggregate}`;
    try {
      const response = await fetch(`${url}?${query}`);
      const json = await response.json();
      const result = json?.Data?.Data;

      return result;
    } catch (e) {
      return new Error(`Failed to fetch`);
    }
  };

  const { data, run } = useRequest(getHistoryPrice, {
    pollingInterval: 60000,
    manual: true,
  });
  useMount(() => {
    run();
    // getPriceFromExchange();
  });

  const getPriceList = useCallback(() => {
    if (!data) return;
    setCurPrice((old) => {
      // 判断当前数据数量 为零 则全部push
      if (!old?.length) {
        return data;
      }
      const _old = JSON.parse(JSON.stringify(old));

      if (data?.length > 2) return _old;
      const tempLastest = data.slice(-1);
      const tempLastestTime = tempLastest?.time;
      const oldLastTime = _old.slice(-1)?.time;
      if (oldLastTime > tempLastestTime) return _old;
      // 非零，则每次添加一个
      return [..._old, ...data.slice(-1)];
    });
  }, [data]);

  useEffect(() => {
    if (data) {
      if (data?.length && curLen !== 1) {
        setCurLen(1);
      }
      getPriceList();
    }
  }, [curLen, data, getPriceList]);

  useEffect(() => {
    if (cuPrice) {
    //   console.table(cuPrice);
    }
  }, [cuPrice]);

  const finalPrice = useMemo(() => {
    if (!cuPrice?.length) return [];
    return cuPrice.map((i: MarketDataItem) => ({
      t: +dayjs.unix(i.time),
      c: i.close.toString(),
    }));
  }, [cuPrice]);

  return finalPrice;
};

export default useHistoryData;
