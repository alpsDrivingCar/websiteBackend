const axios = require('axios');

exports.getTransactions = async (req, res) => {
  try {
    // Basic Auth credentials
    const username = process.env.ELAVON_MERCHANT_ALIAS; // Store sensitive data in environment variables
    const password = process.env.ELAVON_SECRET_KEY;

    // Get limit from query params or use default value of 30
    const limit = req.query.limit || 30;

    const url = `${process.env.ELAVON_URL}/transactions?limit=${limit}`;

    // Make the request
    const response = await axios.get(url, {
      auth: {
        username,
        password,
      },
    });

    // Filter and format data
    const filteredTransactions = response.data.items.map(item => ({
      createdAt: item.createdAt,
      type: item.type,
      paymentMethod: item.paymentMethod,
      total: item.total,
      shopperEmailAddress: item.shopperEmailAddress,
      state: item.state,
      id: item.id,
    }));

    // Respond with filtered data
    res.status(200).json({
      success: true,
      transactions: filteredTransactions,
    });
  } catch (error) {
    // Handle errors
    const statusCode = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data : error.message;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
