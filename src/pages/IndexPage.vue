<template>
    <div>
        <div class="tradingview-widget-container flex flex-col">
            <h3 class="mb-4 text-xl font-extrabold leading-none tracking-tight text-gray-900 md:text-2xl lg:text-2xl">Liquidation History {{ filters.pairs && filters.pairs.base_asset}}</h3>

            <div v-if="init"
                class="container xl mx-auto flex items-start flex-wrap">
                <div class="w-2/12 p-2">
                    <vue-table
                        v-model="filters.pairs"
                        :data="symbols"
                        label="base_asset"
                        class="symbol-table"
                        @update:modelValue="fetch()"
                    ></vue-table>
                </div>
                <div class="w-10/12 p-2">
                    <div v-if="init" class="container xl mx-auto flex items-end flex-wrap">
                        <div class="w-2/12 px-2">
                            <VueSelect
                                v-model="filters.timeframe"
                                :options="[
                                    '1h',
                                    '4h',
                                    '1D',
                                ]"
                                @update:modelValue="fetch()"
                            />
                        </div>

                        <div class="w-6/12 px-2">
                            <VueSelect
                                v-model="filters.exName"
                                :options="exchange"
                                :reduce="exs => exs.code"
                                label="name"
                                multiple
                                disabled
                                @update:modelValue="fetch()"
                            />
                        </div>
                    </div>
                    <div class="liquidation-chart">
                        <canvas id="chart"></canvas>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>

import VueTable from '@/components/VueTable.vue'
import VueSelect from "vue-select";
import axios from 'axios'
import Chart from 'chart.js/auto';
import moment from 'moment'
import 'chartjs-adapter-moment';
import numeral from 'numeral'

let myChart

export default {
    name: 'LiqCoin',
    components: {
        VueSelect,
        VueTable,
    },
    data() {
        return {
            init: false,
            symbols: [],
            exchange: [],

            filters: {
                pairs: {
                    base_asset: "BTC",
                    data: [
                        {
                            exchange: "A",
                            symbol: "BTCUSD_PERP.A",
                        },
                        {
                            exchange: "A",
                            symbol: "BTCUSDC_PERP.A",
                        },
                        {
                            exchange: "A",
                            symbol: "BTCUSDT_PERP.A",
                        },
                        {
                            exchange: "6",
                            symbol: "BTCUSDT.6",
                        },
                        {
                            exchange: "6",
                            symbol: "BTCUSD.6",
                        },
                        {
                            exchange: "6",
                            symbol: "BTCUSDU24.6",
                        },
                        {
                            exchange: "6",
                            symbol: "BTCUSDM24.6",
                        },
                        {
                            exchange: "6",
                            symbol: "BTCPERP.6",
                        },
                        {
                            exchange: "3",
                            symbol: "BTCUSDC_PERP.3",
                        },
                        {
                            exchange: "3",
                            symbol: "BTCUSD_PERP.3",
                        },
                        {
                            exchange: "3",
                            symbol: "BTCUSDT_PERP.3",
                        },
                        {
                            exchange: "F",
                            symbol: "BTCEURT_PERP.F",
                        },
                        {
                            exchange: "F",
                            symbol: "BTCUSDT_PERP.F",
                        },
                    ]
                },
                exName: ['Binance', 'Bybit', 'OKX', 'Bitfinex'],
                timeframe: '1h',
            },

            data:  {},
            price: [],
        }
    },
    created() {
        this.getInit()
    },
    methods: {
        async getInit() {
            const delayedLog = async (name) => {
                await this[name]();
            }

            const promises = ['getPair', 'getExchange'].map(delayedLog);
            await Promise.all(promises);

            this.init = true
            if (this.filters.pairs)
                this.fetch()
        },

        getPair() {
            return axios.get('/all-markets').then(({ data }) => {
                this.symbols = this.filterData(data)
            })
        },
        getExchange() {
            return axios.get('/get-exchange').then(({ data }) => {
                this.exchange = data
            })
        },

        filterData(data) {
            const filterData = data.reduce((result, item) => {
                if (result[item.base_asset]) {
                    result[item.base_asset].data.push({
                        symbol: item.symbol,
                        exchange: item.exchange
                    })
                } else {
                    result[item.base_asset] = {
                        base_asset: item.base_asset,
                        data: [{
                            symbol: item.symbol,
                            exchange: item.exchange
                        }]
                    }
                }

                return result
            }, {})

            return Object.values(filterData)
        },

        async fetch() {
            if (!this.filters.pairs) return

            this.data = {}

            const reqData = this.filters.pairs.data
                .filter((item) => {
                    const exName = this.exchange.find(it => it.code == item.exchange).name
                    return this.filters.exName.includes(exName)
                })
                .map((item) => item.symbol)

            // const delayedLog = async ([name, data], index) => {
            //     if (index == 0)
            //         await this.getFutureMarket(data[0])

            //     await this.getLiqHistory(name, data);
            // }

            // const promises = Object.entries(reqData).map(delayedLog);
            // await Promise.all(promises);

            await this.getFutureMarket(reqData[0])
            await this.getLiqHistory(reqData);

            !myChart
                ? this.initChart()
                : this.updateChart()
        },
        autoUpdate() {
            let count = 0

            const updateTime = () => {
                const minutes = moment(Date.now()).format('mm')

                if ([0, 15, 30, 45].includes(+minutes)) {
                    if (count != +minutes)
                        this.fetch()

                    count = +minutes
                }
                setTimeout(updateTime, 1000)
            }

            updateTime()
        },
        getTime() {
            let dNow = moment(Date.now())
            let dFrom = moment(Date.now())

            switch (this.filters.timeframe) {
                case '1h':
                    return {
                        interval: '1hour',
                        from: dFrom.add(-7, 'day').unix(),
                        to: dNow.unix(),
                    }
                case '4h':
                    return {
                        interval: '4hour',
                        from: dFrom.add(-1, 'month').unix(),
                        to: dNow.unix(),
                    }
                case '1D':
                    return {
                        interval: 'daily',
                        from: dFrom.add(-6, 'month').unix(),
                        to: dNow.unix(),
                    }
            }
        },
        getFutureMarket(symbols) {
            return axios.get('/future-markets', {
                    params: {
                        symbols: symbols,
                        ...this.getTime(),
                        convert_to_usd: true,
                    }
                })
                .then(({ data }) => {
                    this.price = data[0].history.map(({ t, c }) => ({ x: t * 1000, y: c }))
                })
        },
        getLiqHistory(symbols) {
            return axios.get('/liquidation-history', {
                    params: {
                        symbols: symbols.join(', '),
                        ...this.getTime(),
                        convert_to_usd: true,
                    }
                })
                .then(({ data }) => {
                    data.forEach(({ symbol, history }) => {
                        const arrSymbol = symbol.split('.')
                        const code = arrSymbol[arrSymbol.length - 1]
                        const exName = this.exchange.find(item => item.code == code).name

                        history.forEach((item) => {
                            this.createHistory(item, exName)
                        })
                    })
                })
        },

        createHistory(item, exName) {
            if (!this.data[exName]) {
                this.data[exName] = { long: {}, short: {} }
            }

            if (!this.data[exName].long[item.t]) {
                this.data[exName].long[item.t] = 0
            }

            if (!this.data[exName].short[item.t]) {
                this.data[exName].short[item.t] = -item.s
            }

            this.data[exName].long[item.t] += item.l
            this.data[exName].short[item.t] -= item.s
        },

        getDatasets() {
            const getData = (arr) => Object.entries(arr).map(([x, y]) => ({ x: x * 1000, y }))

            return [
                {
                    label: 'Price',
                    data: this.price,
                    borderColor: 'rgba(75, 192, 192, 0.5)',
                    fill: false,
                    yAxisID: 'y1',
                    pointRadius: 0,
                    pointHoverRadius: 0,
                },
                ...Object.keys(this.data).reduce((res, key) => {
                    res.push({
                        label: key + ' Long',
                        data: getData(this.data[key].long),
                        borderColor: '#229022',
                        backgroundColor: '#229022',
                        pointRadius: 3,
                        pointHoverRadius: 7,
                        fill: true,
                        stack: 'combined',
                        type: 'bar',
                    })

                    res.push({
                        label: key + ' Short',
                        data: getData(this.data[key].short),
                        borderColor: '#e63b3b',
                        backgroundColor: '#e63b3b',
                        pointRadius: 3,
                        pointHoverRadius: 7,
                        fill: true,
                        stack: 'combined',
                        type: 'bar',
                    })
                    return res
                }, []),
            ]
        },

        updateChart() {
            myChart.data.datasets = this.getDatasets();
            myChart.update();
        },

        initChart() {
            this.autoUpdate()

            var chart = document.getElementById('chart').getContext('2d');

            myChart = new Chart(chart, {
                type: 'line',
                data: {
                    datasets: this.getDatasets()
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {

                                    const getLabel = (position) => {
                                        const data = Object.entries(this.data)
                                        let index = context.parsed.x / 1000

                                        const { labels, sum } = data.reduce((res, [name, item]) => {
                                                if (item[position][index]) {
                                                    let money = numeral(item[position][index]).format('0,0.00')
                                                    res.labels.push(`${name}: ${position == 'long' ? '-' : ''}${money} $`)
                                                    res.sum = res.sum + item[position][index]
                                                } else {
                                                    res.labels.push(`${name}: 0,00$\n`)
                                                }

                                                return res
                                            }, {
                                                labels: [
                                                    `Liquidation ${position}`,
                                                    '',
                                                ],
                                                sum: 0,
                                            })

                                        return [...labels, '', `Разом: ${position == 'long' ? '-' : ''}${numeral(sum).format('0,0.00')} $`]
                                    }

                                    const label = getLabel(context.parsed.y < 0 ? 'short' : 'long')
                                    return label
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            display: true,
                            stacked: true,
                            time: {
                                unit: 'hour',
                                displayFormats: {
                                    hour: 'hh:mm',
                                },
                                tooltipFormat: ''
                            },
                            ticks: {
                                source: 'auto',
                                major: {
                                    enabled: true
                                },
                                //margin: 0,
                                padding: 0,
                                maxRotation: 0
                            },
                            grid: {
                                color: 'rgba(51, 51, 51, 0.2)', // Прозорість ліній сітки
                                borderDash: [1, 1],
                                //drawTicks: true,
                            }
                        },
                        y: {
                            type: 'linear',
                            stacked: true,
                            ticks: {
                                beginAtZero: false,
                            },
                            grid: {
                                color: 'rgba(51, 51, 51, 0.2)', // Прозорість ліній сітки
                                borderDash: [1, 1]
                            },
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                display: false
                            }
                        },
                    },
                }
            });
        }
    }
}
</script>

<style>
.symbol-table {
    height: 40vh;
    min-height: 500px;
}
.liquidation-chart {
    position: relative;
    margin: auto;
    margin-top: 20px;
    height: 40vh;
    width: 100%;
    min-height: 500px;
}
</style>
