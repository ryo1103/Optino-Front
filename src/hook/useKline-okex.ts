import { useMount, useRequest, useUnmount } from "ahooks";
import { useState } from "react";
import WebSocket from "websocket";


// const ws = new WebSocket.w3cwebsocket("wss://stream.binance.com:9443/ws");


const useKLineOkex = () => {
  const [data, setData] = useState([]);
  const [ws, setWs]: any = useState(null)

  const sendPong = () => {};

  const sendMessage = async (limit: any) => {
    if(!ws) return;
    if (ws.readyState!==1) return 
    // 发送订阅消息
    try{
      ws.send(
        JSON.stringify({
          "op": "subscribe",
          "args": [{
              "channel": "candle1s",
              "instId": "ETH-USDT"
          }]
      }
      )
      );
    return Promise.resolve("DONE");

    }catch(e){
      console.log('e', e)
      ws.close()
    }
   
  };

  const { run: getFullData } = useRequest(() => sendMessage(200), {
    manual: true,
  });

  const { run: getSingleData } = useRequest(() => sendMessage(1), {
    manual: true,
    pollingInterval: 1000,
  });

  const startSocket = () => {
    console.log('ws.send(',1)
    const ws = new WebSocket.w3cwebsocket("wss://wsaws.okx.com:8443/ws/v5/public");
    setWs(ws)
    ws.onopen = () => {
      getFullData();
    };
    ws.onerror = (event: any) =>{
      console.log('event', event)
    }
    ws.onmessage = (event: any) => {
      const data = JSON.parse(event.data);

    //   console.log("data", data, event); // todo 检查pong
      if (!data?.data?.length) return;
      //   {time: { year: 2018 ,month: 12 ,day: 30 }, value: 29.567577074788517}
      const trullyData = data.data.map((i: any) => {
        const curDate = +i[0]
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
      }).sort((a: { t: number; },b: { t: number; })=> b?.t - a?.t > 0);
      if (!trullyData?.length) return;

      setData((old: any) => {
        const _old = JSON.parse(JSON.stringify(old));
        if(_old.slice(-1)[0]?.time >= trullyData[0]?.time) return _old;


        if (_old?.length >= 800) {
          _old.shift();
        }
        _old.push(...trullyData);
        return _old;
      });
    };
  };

  // useEffect(() => {
  //   if (data?.length) {
  //     getSingleData();
  //   }
  // }, [data?.length]);

  useMount(() => startSocket());
  useUnmount(()=>{
    if(!ws) return;
    ws.close()
  })

  return {data, getSingleData, ws};
};
export default useKLineOkex;
