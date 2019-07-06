const Base64 = require("js-base64").Base64;
const request = require("request-promise-native");
const _ = require("underscore");
const querystring = require("querystring");
const cheerio = require("cheerio");

class PoePrices {
  /**
   * Requests item price prediction from poeprices.info
   *
   * @param {string} itemText Item text copied from Path of Exile
   * @returns {Promise}
   * @fulfil {Object} - Object containing the requested item encoded in base64 and the result
   * @reject {Error} - The `error.message` contains information about why the promise was rejected
   */
  static request(itemText) {
    return new Promise(function(resolve, reject) {
      console.log("checking price...");
      // itemText = itemText.replace(/<<.*?>>|<.*?>/g, "");

      var url = "https://www.poeprices.info/query";
      var form = {
        league: "Legion",
        itemtext: itemText
      };

      var formData = querystring.stringify(form);
      var contentLength = formData.length;

      request(
        {
          headers: {
            "Content-Length": contentLength,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          uri: url,
          body: formData,
          method: "POST"
        },
        function(err, res, body) {
          if (err) {
            reject(
              new Error(
                "Request to <b>poeprices.info</b> failed. Received an empty response!"
              )
            );
          }
          const $ = cheerio.load(body);
          const price = $(
            ".price_highlight"
          ).text();
          resolve({ encodedItemText: Base64.encode(itemText), price });
        }
      );
      // var parameters = querystring.stringify({ i: Base64.encode(itemText), l: config.get("league"), s: "xenontrade" });
      // var parsedParams = querystring.parse(parameters);

      // request(url + parameters, {json: true})
      // .then((response) => {
      //   if(!PoePrices.hasAllKeys(response) || response.error !== 0) {
      //     var requestObject = { request: { parameters: parsedParams, itemText }, response };

      //     log.warn("Request to poeprices.info failed. Received an empty response.\n" + JSON.stringify(requestObject, null, 4));
      //     reject(new Error("Request to <b>poeprices.info</b> failed. Received an empty response."));
      //   } else {
      //     resolve({encodedItemText: parsedParams.i, price: response});
      //   }
      // })
      // .catch((error) => {
      //   log.warn("Request to poeprices.info failed.\n" + JSON.stringify(error, null, 4));
      //   reject(new Error("Request to <b>poeprices.info</b> failed. " + error.error));
      // });
    });
  }

  /**
   * Returns `true` if the response from poeprices.info has all required key properties
   *
   * @param {Object} response Response from poeprices
   * @returns {boolean}
   */
  static hasAllKeys(response) {
    var requiredKeys = ["currency", "min", "max", "pred_explanation", "error"];

    return _.every(requiredKeys, _.partial(_.has, response));
  }
}

module.exports = PoePrices;
