const fqaController = require('../../Controller/FQA/fqaCotroller');
const express = require('express');
const router = express.Router();

router.get('/', fqaController.getFAQs);
router.get('/byId', fqaController.getFAQById);
router.post('/', fqaController.createFAQ);
router.delete('/:id', fqaController.deleteFAQById);
router.put('/:id', fqaController.updateFAQById);

module.exports = router;
