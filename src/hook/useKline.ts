import { useMount, useRequest } from "ahooks";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import WebSocket from "websocket";


// const ws = new WebSocket.w3cwebsocket("wss://stream.binance.com:9443/ws");
const ws = new WebSocket.w3cwebsocket("wss://ws-api.binance.com:443/ws-api/v3");

const useKLine = () => {
  const [data, setData] = useState([]);

  const sendPong = () => {};

  const sendMessage = async (limit: any) => {
    // 发送订阅消息
    ws.send(
      JSON.stringify({
        id: "b137468a-fb20-4c06-bd6b-625148eec958",
        method: "uiKlines",
        params: {
          symbol: "ETHUSDT",
          interval: "1s",
          // startTime: 1655969280000,
          limit,
        },
      })
    );
    return Promise.resolve("DONE");
  };

  const { run: getFullData } = useRequest(() => sendMessage(200), {
    manual: true,
  });

  const { run: getSingleData } = useRequest(() => sendMessage(1), {
    manual: true,
    pollingInterval: 1000,
  });

  const startSocket = () => {
    ws.onopen = () => {
      getFullData();
    };
    ws.onmessage = (event: any) => {
      const data = JSON.parse(event.data);
    //   console.log("data", data, event); // todo 检查pong
      if (!data?.result?.length) return;
      //   {time: { year: 2018 ,month: 12 ,day: 30 }, value: 29.567577074788517}
      const trullyData = data.result.map((i: any) => {
        const curDate = +dayjs(i[0])
        // .format('YYYY-MM-DD-HH-MM-SS');
        return {
        //   t: i[0],
        //   c: i[4],
          value: Number(i[4]),
          time: curDate,
        //   time: {
        //     year: curDate.year(),
        //     month: curDate.month(),
        //     day: curDate.day(),
        //     // hour: curDate.hour(),
        //     // second: curDate.second(),
        //   },
        };
      }).sort((a: { t: number; },b: { t: number; })=> b?.t - a?.t);
      if (!trullyData?.length) return;

      setData((old: any) => {
        const _old = JSON.parse(JSON.stringify(old));

        if(_old.slice(-1)[0]?.time === trullyData[0]?.time) return _old;


        if (_old?.length >= 800) {
          _old.shift();
        }
        _old.push(...trullyData);
        return _old;
      });
    };
  };

  useEffect(() => {
    if (data?.length) {
      getSingleData();
    }
  }, [data?.length, getSingleData]);

  useMount(() => startSocket());

  return {data, getSingleData, ws};
};
export default useKLine;
