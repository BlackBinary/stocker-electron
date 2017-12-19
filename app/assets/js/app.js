// Define settings for the main application
let SETTINGS = {
    CONVERT: 'EUR', // Main currency to display
    LIMIT: 100, // Change to default value or keep it like this for the height of the console
    TIME: '24H', // Choose between 1h, 24h, 7d of change time,
    INTERVAL: 20000 // 20000 = 20 seconds
};

// Coins of interest
let COI = [
    'BTC',
    'ETH',
    'XMR',
    'ETN',
    'QRS',
    'UBIQ'
];

// The API we're using for grabbing cryptocurrency prices.  The service can be
// found at: https://coinmarketcap.com/api/
let COINMARKETCAP_API_URI = "https://api.coinmarketcap.com";

let prevResult = null;

let lookupArray = [];

let app = new Vue({
    el: "#app",
    data: {
        coins: [],
        coinData: {}
    },
    methods: {

        // Get the top
        getCoins: function () {
            let self = this;

            axios.get(COINMARKETCAP_API_URI + "/v1/ticker/?convert=EUR")
                .then((resp) => {
                    this.gatherStocks(resp.data);
                })
                .catch((err) => {
                    console.error(err);
                });
        },

        gatherStocks: function (result) {
            let plotRows = [];
            let isUpdate = false;

            for (let key in result) {
                // Get the current stock value
                let stockValue = result[key];

                // Define the lets for the rest of the applications
                let symbol = stockValue.symbol;
                let rank = stockValue.rank;
                let pricebtc = stockValue.price_btc;
                let priceval = stockValue[this.plotSettings().price];
                let updated = '=';
                let change = stockValue[this.plotSettings().change];

                // Push new id to the lookup table and set the info we want
                lookupArray[stockValue.id] = rank;

                if (prevResult) {
                    let prevValue = prevResult[key];

                    if (stockValue.last_updated !== prevValue.last_updated) {
                        isUpdate = true;
                        if (stockValue.id == prevValue.id) {
                            pricebtc = compareResult(pricebtc, prevValue.price_btc.substring(0, 8));
                            priceval = compareResult(priceval, prevValue[this.plotSettings().price].substring(0, 8));
                            change = compareResult(stockValue[this.plotSettings().change], prevValue[this.plotSettings().change]);
                            updated = '+';
                        } else {
                            rank = compareResult(lookupArray[prevValue.id], lookupArray[stockValue.id]);
                            updated = '?';
                        }
                    }
                }

                if (COI.indexOf(symbol) !== -1) {
                    symbol = "*" + symbol + "*";
                }

                // Filter the lets we want
                let plotValues = {
                    'name': symbol,
                    'rank': rank,
                    'price': priceval,
                    'price_btc': pricebtc,
                    'updated': updated,
                    'change': change
                };

                plotRows.push(plotValues);
            }

            if (isUpdate || !prevResult) {
                this.coins = plotRows;
                console.log(this.coins);
            }

            prevResult = result;
        },

        // Return CSS for positive and negative values
        getColor: (num) => {
            return num > 0 ? "color:green;" : "color:red;";
        },

        plotSettings: function () {
            let currency = SETTINGS.CONVERT.toLowerCase();
            let time = SETTINGS.TIME.toLowerCase();

            let properties = {
                price: 'price_' + currency,
                change: 'percent_change_' + time
            };

            return properties;
        },
    },

    // As soon as VUE gets loaded, load the data once
    created: function () {
        this.getCoins();
    }
});

// Set the interval for getting the coins
setInterval(() => {
    app.getCoins();
}, SETTINGS.INTERVAL);
