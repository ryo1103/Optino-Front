const express = require('express');
const {
    createProxyMiddleware
} = require('http-proxy-middleware');
const ccxt = require('ccxt');

const app = express();


async function symbolLoop(exchange, symbol, timeframe) {
    while (true) {
        try {
            const ohlcvs = await exchange.fetchOHLCV(symbol, timeframe)
            console.log(exchange.iso8601(exchange.milliseconds()), exchange.id, symbol, ohlcvs.length, 'OHLCV candles received')
            // await exchange.sleep (60 * 1000) // sleep if necessary, though not required
        } catch (e) {
            console.log(exchange.iso8601(exchange.milliseconds()), exchange.id, symbol, e.constructor.name, e.message)
        }
    }
}


app.get('/api/getFullPrice', (req, result) => {
    const exchange = new ccxt.binance({
        'enableRateLimit': true,
        'reload_markets': true,
        'apiKey': '6mDFrZOZpBVNTL3Ijz5MGE61g7Fohz9exyTH81SmkkplJhOFLVoowD3Dq2MAjkra',
        'secret': 'WOgymk1HSo4qFXaBG5isc7FvgZXW9XiIo0dGIvE2uHuD3DXQeSOgBMPGwcvVzljs',
        'options': {
            'recvWindow': 18000
        }
    });

    const symbol = 'ETH/USD';
    const timeframe = '1m';
    const limit = 1; // 获取最近 30 天的历史数据

    exchange.loadMarkets().then(() => {
        exchange.fetch_ohlcv(symbol, timeframe, undefined, limit).then(res => {
            result.end(JSON.stringify(res));
        })
    })
})

// 启动服务
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Node.js server listening on http://localhost:${port}`);
});