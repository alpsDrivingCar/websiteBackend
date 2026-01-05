const axios = require('axios');

exports.getElavonTransactionStatus = async function getElavonTransactionStatus(transaction) {
    const response = await axios({
      method: "GET",
      url: transaction,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.ELAVON_MERCHANT_ALIAS}:${process.env.ELAVON_SECRET_KEY}`
          ).toString("base64"),
      },
    });
    return response.data.state;
  }