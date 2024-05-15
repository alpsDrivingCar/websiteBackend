const FranchiseOpportunity = require('../../model/franchise/franchiseSchema');

// Create a Franchise Opportunity
exports.createFranchiseOpportunity = (req, res) => {
    const franchiseOpportunity = new FranchiseOpportunity(req.body);

    franchiseOpportunity.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to create Franchise Opportunity', error: err.message });
        });
}

// Get All Franchise Opportunities
exports.getFranchiseOpportunities = (req, res) => {
    FranchiseOpportunity.find()
        .then(franchiseOpportunities => {
            res.json({ data: franchiseOpportunities });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch Franchise Opportunities', error: err.message });
        });
}

// Get Franchise Opportunity by ID
exports.getFranchiseOpportunityById = (req, res) => {
    FranchiseOpportunity.findById("66447d9afbe933d725bd038a")
        .then(franchiseOpportunity => {
            if (!franchiseOpportunity) {
                return res.status(404).json({ message: 'Franchise Opportunity not found' });
            }
            res.json({ data: franchiseOpportunity });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch Franchise Opportunity', error: err.message });
        });
}

// Update Franchise Opportunity by ID
exports.updateFranchiseOpportunityById = (req, res) => {
    FranchiseOpportunity.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(updatedFranchiseOpportunity => {
            if (!updatedFranchiseOpportunity) {
                return res.status(404).json({ message: 'Franchise Opportunity not found' });
            }
            res.json({ data: updatedFranchiseOpportunity });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to update Franchise Opportunity', error: err.message });
        });
}

// Delete Franchise Opportunity by ID
exports.deleteFranchiseOpportunityById = (req, res) => {
    FranchiseOpportunity.findByIdAndDelete(req.params.id)
        .then(deletedFranchiseOpportunity => {
            if (!deletedFranchiseOpportunity) {
                return res.status(404).json({ message: 'Franchise Opportunity not found' });
            }
            res.json({ data: 'Franchise Opportunity deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to delete Franchise Opportunity', error: err.message });
        });
}
