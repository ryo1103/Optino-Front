/* eslint-disable newline-per-chained-call */
import { useSize } from "ahooks";
import BigNumber from "bignumber.js";
import { maxBy, minBy } from "lodash-es";
import * as React from "react";
import styled from "styled-components";
import { loadImage } from "../utils";

const TREND_LINE_DIAM = 10 * (window.devicePixelRatio || 1);
const TREND_LIST_TOTAL = 31;
// const OFFSITE = 20;

const Wrapper = styled.div<{ size: { width: number; height: number } }>`
  flex: none !important;
  /* width: ${({ size }) => size.width}px; */
  /* height: ${({ size }) => size.height}px; */
  width: 100%;
  height: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
`;

// t: 时间戳，表示交易的时间或者数据更新的时间。
// s: 标的资产，通常是一个代币的符号或名称。
// sn: 标的资产名称，通常是标的资产的全名或描述。
// c: 最新成交价，也就是当前时刻的资产价格。
// h: 当日最高价，表示当天内标的资产的最高价格。
// l: 当日最低价，表示当天内标的资产的最低价格。
// o: 当日开盘价，表示当天内标的资产的开盘价格。
// v: 成交量，表示标的资产在某个时间段内的成交量。
type MarketData = Array<{ t: number; c: string }>;

interface TrendProps {
  size?: { width: number; height: number };
  type?: "up" | "down";
  data: MarketData;
  factor?: string | number | undefined;
}

interface InitParamProps {
  canvasX: number;
  offsetX: number;
  canvasY: number;
  offsetY: number;
  min: string;
  max: string;
  diff: string;
}

const Trend: React.FC<TrendProps> = (props: TrendProps) => {
  const {
    type = "up",
    size = { width: 700, height: 271 },
    data = [],
    factor = 1,
  } = props;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [initParam, setInitParam] = React.useState<InitParamProps>();
  const [source, setSource] = React.useState<MarketData>([]);
  const [dataPoints, setDataPoints] = React.useState<any>([]);
  const canvasSize = useSize(canvasRef.current);

  const filterTrend = React.useCallback(() => {
    const { width, height } = size;
    const from = data?.length - TREND_LIST_TOTAL;
    const newData = data.slice(from, TREND_LIST_TOTAL);

    const ratio = window.devicePixelRatio || 1;
    const x = width * ratio * 2;
    const y = height * ratio * 2;
    const max = maxBy(newData, (ele) => Number(ele.c))?.c || "0";
    const min = minBy(newData, (ele) => Number(ele.c))?.c || "0";

    const params: InitParamProps = {
      canvasX: x,
      offsetX: x - TREND_LINE_DIAM * 2,
      canvasY: y,
      offsetY: y - TREND_LINE_DIAM * 2,
      min,
      max,
      diff: new BigNumber(max).minus(min).toString(),
    };

    // console.log(params);
    setInitParam(params);
    setSource(newData);
  }, [data, size]);

  React.useEffect(() => {
    if (data?.length) {
      filterTrend();
    }
  }, [data]);

  const drawTrend = React.useCallback(() => {
    if (!canvasRef || !canvasRef.current || !initParam || !canvasSize?.width) return;
    const { canvasX, offsetX, canvasY, offsetY, max, diff } = initParam;

    setDataPoints([]);

    const realCanvasFactorX = BigNumber(canvasX)
      .div(canvasSize!.width)
      .toNumber();
    const realCanvasFactorY = BigNumber(canvasY)
      .div(canvasSize!.height)
      .toNumber();

    const wholeOffsetX = BigNumber(canvasX)
      .minus(BigNumber(canvasX).multipliedBy(factor))
      .div(2)
      .toNumber();
    const wholeOffsetY = BigNumber(canvasY)
      .minus(BigNumber(canvasY).multipliedBy(factor))
      .div(2)
      .toNumber();

    const ctx = canvasRef.current.getContext("2d")!;
    const line = new Path2D();
    const newDataTotal = source.length - 1;

    ctx.font = "120px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (newDataTotal < 1) return;
    ctx.clearRect(0, 0, canvasX, canvasY);

    source.forEach(async ({ c, t }, index, cur) => {
      const x = new BigNumber(index)
        .dividedBy(newDataTotal)
        .multipliedBy(offsetX)
        .plus(TREND_LINE_DIAM)
        .multipliedBy(factor || 0)
        .plus(wholeOffsetX)
        .toNumber();

      const y = new BigNumber(max)
        .minus(c)
        .dividedBy(diff)
        .multipliedBy(offsetY)
        .plus(TREND_LINE_DIAM)
        .multipliedBy(factor || 0)
        .plus(wholeOffsetY)
        .toNumber();
      line.lineTo(x, y);

      setDataPoints((old: any) => {
        const _ = JSON.parse(JSON.stringify(old));
        return [..._, { canvasX: x, canvasy: y, c, t, x: BigNumber(x).multipliedBy(realCanvasFactorX).toNumber(), y: BigNumber(x).multipliedBy(realCanvasFactorY).toNumber() }];
      });
    });

    // ctx.strokeStyle = type === "up" ? "#00ba6c" : "#e55d75";
    ctx.strokeStyle = "#1300F2";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = TREND_LINE_DIAM;
    ctx.stroke(line);
  }, [factor, initParam, source]);

  const drawTooltip = async () => {
    if (!canvasRef || !canvasRef.current || !initParam) return;

    const ctx = canvasRef.current.getContext("2d")!;
    const lastSource = source.slice(-1)[0];
    const index = source?.length - 1;
    const backImg = await loadImage(require("../assets/images/bullV2.png"));
    const { canvasX, offsetX, canvasY, offsetY, max, diff } = initParam;
    const wholeOffsetX = BigNumber(canvasX)
      .minus(BigNumber(canvasX).multipliedBy(factor))
      .div(2)
      .toNumber();
    const wholeOffsetY = BigNumber(canvasY)
      .minus(BigNumber(canvasY).multipliedBy(factor))
      .div(2)
      .toNumber();

    const x = new BigNumber(index)
      .dividedBy(index)
      .multipliedBy(offsetX)
      .plus(TREND_LINE_DIAM)
      .multipliedBy(factor || 0)
      .plus(wholeOffsetX)
      .toNumber();

    const y = new BigNumber(max)
      .minus(lastSource?.c)
      .dividedBy(diff)
      .multipliedBy(offsetY)
      .plus(TREND_LINE_DIAM)
      .multipliedBy(factor || 0)
      .plus(wholeOffsetY)
      .toNumber();

    ctx.drawImage(backImg, x - 250, y - 250, 500, 550);
  };

  React.useEffect(() => {
    if(!canvasSize?.width) return;
    drawTrend();
    drawTooltip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initParam, source, type, canvasSize?.width]);

  React.useEffect(() => {
    if (canvasSize?.width && dataPoints?.length) {
        mouseMove();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, dataPoints, initParam, source, type]);

  const mouseMove = () => {
    if (
      !canvasRef ||
      !canvasRef.current ||
      !initParam ||
      !source ||
      !canvasSize?.width
    )
      return;

    canvasRef.current.addEventListener("mousemove", (e) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const singleFactorX = BigNumber(canvasSize?.width)
        .div(source.length)
        .toNumber();

      const singleFactorY = BigNumber(canvasSize?.height)
        .div(source.length)
        .toNumber();
      // console.log("singleFactor", singleFactorX, source);
      // const dataPoints = source.map((i, index) => ({
      //   ...i,
      //   x: index * singleFactorX,
      //   y: index * singleFactorY,
      // }));

      console.log("dataPoints", dataPoints);

      for (const point of dataPoints) {
        // 计算鼠标与点的距离
        const distance = Math.sqrt(
          (mouseX - point.x) ** 2 + (mouseY - point.y) ** 2
        );

        if (distance <= 5) {
          // 如果距离小于点的半径，则鼠标在点上
          console.log(`Mouse is over point (${point.x}, ${point.y})`);
          break; // 如果找到了一个点，就不用继续循环了
        }
      }
    });
  };

  return (
    <Wrapper size={size}>
      {initParam && (
        <canvas
          width={initParam.canvasX}
          height={initParam.canvasY}
          ref={canvasRef}
        />
      )}
    </Wrapper>
  );
};

export default React.memo(Trend);
