const api_key = '824367C3B8AA3C7EADD70FF8A0DB3516'; // stolen from SIH :^)
/*
    HELO I AM VERY MUCH AWARE THIS CODE IS SHIT
     BUT IT WORKS (HOPEFULLY) SO DONT COMPLAIN
*/

/*
    todo:
        i got no error handler for http errors :C

*/

// 1689906398 is chroma 3 case key XD

var keyPrices = [];

var yql = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDGBP%22%2C%20%22USDEUR%22%2C%20%22USDRUB%22%2C%20%22USDBRL%22%2C%20%22USDJPY%22%2C%20%22USDNOK%22%2C%20%22USDIDR%22%2C%20%22USDMYR%22%2C%20%22USDPHP%22%2C%20%22USDSGD%22%2C%20%22USDTHB%22%2C%20%22USDVND%22%2C%20%22USDKRW%22%2C%20%22USDTRY%22%2C%20%22USDUAH%22%2C%20%22USDMXN%22%2C%20%22USDCAD%22%2C%20%22USDAUD%22%2C%20%22USDNZD%22%2C%20%22USDPLN%22%2C%20%22USDCHF%22%2C%20%22USDAED%22%2C%20%22USDCLP%22%2C%20%22USDCNY%22%2C%20%22USDCOP%22%2C%20%22USDPEN%22%2C%20%22USDSAR%22%2C%20%22USDTWD%22%2C%20%22USDHKD%22%2C%20%22USDZAR%22%2C%20%22USDINR%22)&format=json&env=store://datatables.org/alltableswithkeys&callback=";
$.getJSON(yql, function (data) {
    var rates = data.query.results.rate;
    var moneyJsRates = {};
    moneyJsRates["USD"] = 1;

    $.each(rates, function (index, rate) {
        var code = rate.id.split('USD')[1];
        var rate = parseFloat(rate.Rate);
        moneyJsRates[code] = rate;
    });
    console.log(moneyJsRates);

    // Check money.js has finished loading:
    if (typeof fx !== "undefined" && fx.rates) {
        fx.rates = moneyJsRates;
        fx.base = "USD";
    } else {
        // If not, apply to fxSetup global:
        var fxSetup = {
            rates: moneyJsRates,
            base: "USD"
        }
    }
    main();
});

function main() {
    GetAssetPrices(function (error, rawPrices) {
        if (!error) {
            var tempKeyPrices = rawPrices.result.assets.filter((asset) => asset.classid == "1689906398")[0].prices; // only two == ? ?? ? ?
            console.log(tempKeyPrices);
            tempKeyPrices = _.pickBy(tempKeyPrices, (cost, currency) => cost !== 0);
            tempKeyPrices = _.mapValues(tempKeyPrices, (cost) => cost / 100);
            console.log(tempKeyPrices);

            keyPrices = [];

            _.forOwn(tempKeyPrices, function (cost, currency) {

                console.log(currency + ': ' + cost);

                if (currency in fx.rates) {
                    keyPrices.push({
                        currency: currency,
                        cost: cost,
                        usd_cost: Number(fx(cost).from(currency).to('USD').toFixed(2))
                    });
                } else {
                    keyPrices.push({
                        currency: currency,
                        cost: cost,
                        usd_cost: 0.00
                    });
                }

            });

            console.log(keyPrices);

            var keyPricesArray = [];

            _.forOwn(keyPrices, function (value) {
                keyPricesArray.push([value.currency, value.cost, value.usd_cost]);
            });

            $('#wrapper').html('<table id="key_prices"></table>');

            $('#key_prices').DataTable({
                data: keyPricesArray,
                paging: false,
                sDom: '',
                columns: [
                    { title: 'Currency' },
                    { title: 'Ingame Cost' },
                    { title: 'USD Cost' }
                ]
            });

        } else {
            console.error(":("); // add error message
            $('#wrapper').text("error :^) plz reload page XD");
        }
    });
}

function GetAssetPrices(callback) {
    $.getJSON('https://jsonp.afeld.me/?url=https://api.steampowered.com/ISteamEconomy/GetAssetPrices/v1/?key=' + api_key + '&format=json&appid=730', function (rawPrices) {
        if (rawPrices.result.success) {
            callback(false, rawPrices);
        } else {
            console.error("error :^)");
            callback(true, {});
        }
    });
}
