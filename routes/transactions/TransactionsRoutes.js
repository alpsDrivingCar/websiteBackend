const transactionsController = require('../../Controller/transactions/TransactionsController');
const express = require('express');
const router = express.Router();

router.get('/', transactionsController.getTransactions);


module.exports = router;