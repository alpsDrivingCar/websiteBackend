const franchiseController = require('../../Controller/franchise/franchiseCotroller');
const express = require('express');
const router = express.Router();

router.get('/', franchiseController.getFranchiseOpportunities);
router.get('/byId', franchiseController.getFranchiseOpportunityById);
router.post('/', franchiseController.createFranchiseOpportunity);
router.delete('/:id', franchiseController.deleteFranchiseOpportunityById);
router.put('/:id', franchiseController.updateFranchiseOpportunityById);

module.exports = router;
