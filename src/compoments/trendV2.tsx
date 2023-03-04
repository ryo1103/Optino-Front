import { useMount } from "ahooks";
import BigNumber from "bignumber.js";
import { createChart, IChartApi, LineStyle } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import useKLine from "../hook/useKline";

type StrikePrices = {
  CALL: [];
  PUT: [];
};

let chart: IChartApi | null = null;
let drawed = false;
// {
//     "CALL": [
//         "1677920131",
//         "1665",
//         "1623",
//         "1598",
//         "1571"
//     ],
//     "PUT": [
//         "1677920131",
//         "1477",
//         "1519",
//         "1544",
//         "1571"
//     ]
// }
const Trend = ({ strikePrices }: { strikePrices: StrikePrices }) => {
  const { data }: any = useKLine();

  const target: any = useRef();
  const [currentChart, setCurrentChart]: any = useState(null);
  const [series, setSeries]: any = useState(null);
  const [imgPosition, setImgPosition] = useState({
    top: "0px",
    left: "0px",
    opacity: 0,
  });

  useEffect(() => {
    if (data?.length && currentChart) {
      initData(data);
    }
  }, [data, currentChart]);

  useEffect(() => {
    if (series && !drawed && strikePrices) {
      renderLine(series);
    }
  }, [series, strikePrices, strikePrices]);

  const renderLine = (series: any) => {
    if (!target.current || !currentChart || !chart || drawed) return;
    var lineWidth = 2;

    const calls = strikePrices?.CALL?.slice(1);
    const puts = strikePrices?.PUT?.slice(1);

    if (calls?.length) {
      calls.forEach((i: any) => {
        const callPriceLine = {
          price: Number(i),
          color: "#3abe12",
          lineWidth: lineWidth,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: "call strike price",
        };
        series.createPriceLine(callPriceLine);
      });
    }

    if (puts?.length) {
      puts.forEach((i: any) => {
        const putPriceLine = {
          price: Number(i),
          color: "#2012be",
          lineWidth: lineWidth,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: "call strike price",
        };
        series.createPriceLine(putPriceLine);
      });
    }

    drawed = true;
  };

  const addImageTooltip = (series: any) => {
    if (!target.current || !currentChart || !chart || drawed || !series) return;

    series.setTooltipCallback(function(tooltipData: {
      time: number;
      price: number;
    }) {
      const date = new Date(tooltipData.time * 1000);
      const dateString = date.toLocaleDateString();
      const value = tooltipData.price.toFixed(2);
      const imageUrl = require("../assets/images/bullV2.svg").default;

      const tooltipContent = document.createElement("div");

      const imageContainer = document.createElement("div");
      imageContainer.style.width = "100px";
      imageContainer.style.height = "100px";
      imageContainer.style.backgroundImage = `url(${imageUrl})`;
      imageContainer.style.backgroundSize = "contain";
      imageContainer.style.backgroundRepeat = "no-repeat";
      tooltipContent.appendChild(imageContainer);

      const textContainer = document.createElement("div");
      textContainer.textContent = `时间：${dateString}，价格：${value}`;
      tooltipContent.appendChild(textContainer);

      return tooltipContent;
    });
  };

  const initData = (data: any) => {
    if (!target.current || !currentChart || !chart) return;
    series.setData(data);
  };

  const initChart = () => {
    if (!target.current || currentChart || chart) return;
    chart = createChart(target.current, {
      layout: {
        textColor: "#d1d4dc",
        background: {
          color: "transparent",
        },
      },
      rightPriceScale: {
        // visible: false,
        borderVisible: false,
        scaleMargins: {
          top: 0.3,
          bottom: 0.25,
        },
      },
      crosshair: {
        vertLine: {
          width: 4,
          color: "transparent",
          style: 0,
        },
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
      grid: {
        vertLines: {
          color: "transparent",
        },
        horzLines: {
          color: "transparent",
        },
      },
      timeScale: {
        visible: false,
      },
    });

    setCurrentChart(chart);

    chart.timeScale().fitContent();

    var series = chart.addLineSeries({
      color: "#1300F2",
      lineWidth: 4,
      //   crosshairMarkerVisible: false,
      // crosshairMarkerBorderWidth: 4,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    setSeries(series);
    addImageTooltip(series);

    chart.subscribeCrosshairMove((param: any) => {
      const x = param?.point?.x || 0;
      //   const y = param?.point?.y || 0;

      const data = param.seriesData.get(series);
      const price = data?.value !== undefined ? data?.value : data?.close;
      const y = series?.priceToCoordinate(price);

      if (!x || !y) return;
      setImgPosition({
        left: x - 70 + "px",
        top: y - 70 + "px",
        opacity: 1,
      });
    });
  };

  useMount(initChart);

  return (
    <>
      <div
        ref={target}
        style={{ width: "100%", height: "100%" }}
        className="chart"
      ></div>
      <div className="current-price" style={{ color: "rgba(0,0,0,0.4)" }}>
        Index Price: {BigNumber(data?.slice(-1)[0]?.value).toFixed(2)}
      </div>
      <img
        style={{ ...imgPosition, position: "absolute" }}
        className="tooltip"
        src={require("../assets/images/bullV2.svg").default}
      />
    </>
  );
};

export default Trend;
