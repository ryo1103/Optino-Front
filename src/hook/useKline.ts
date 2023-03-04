import { useMount, useRequest } from "ahooks";
import { useEffect, useState } from "react";
import WebSocket from "websocket";

// const ws = new WebSocket.w3cwebsocket("wss://stream.binance.com:9443/ws");
const ws = new WebSocket.w3cwebsocket("wss://ws-api.binance.com:443/ws-api/v3");

const useKLine = () => {
  const [data, setData] = useState([]);

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

  const { run: getFullData } = useRequest(() => sendMessage(30), {
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
      if (!data?.result?.length) return;
      const trullyData = data.result.map((i: any) => ({ t: i[0], c: i[4] }));
      if (!trullyData?.length) return;

      setData((old: any) => {
        const _old = JSON.parse(JSON.stringify(old));
        if (_old?.length >= 31) {
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

  return data;
};
export default useKLine;
