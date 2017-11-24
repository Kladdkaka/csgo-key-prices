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

var url = "https://api.fixer.io/latest?base=USD";

$.getJSON(url, function (data) {
    var rates = data.rates;
    var moneyJsRates = {};
    moneyJsRates["USD"] = 1;
    
    Object.keys(rates).forEach(code => {
        const rate = rates[code]
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
    $.getJSON('https://cors-anywhere.herokuapp.com/https://api.steampowered.com/ISteamEconomy/GetAssetPrices/v1/?key=824367C3B8AA3C7EADD70FF8A0DB3516&format=json&appid=730', function (rawPrices) {
        if (rawPrices.result.success) {
            callback(false, rawPrices);
        } else {
            console.error("error :^)");
            callback(true, {});
        }
    });
}
