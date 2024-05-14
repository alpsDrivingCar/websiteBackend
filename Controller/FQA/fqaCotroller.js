const FAQSchema = require('../../model/FQA/faqSchema');

// Create a FAQ
exports.createFAQ = (req, res) => {
    const faq = new FAQSchema(req.body);

    faq.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to create FAQ', error: err.message });
        });
}

// Get All FAQs
exports.getFAQs = (req, res) => {
    FAQSchema.find()
        .then(faqs => {
            res.json({ data: faqs });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch FAQs', error: err.message });
        });
}

// Get FAQ by ID
exports.getFAQById = (req, res) => {
    FAQSchema.findById("664360469fb7b2b9fde5f0ad")
        .then(faq => {
            if (!faq) {
                return res.status(404).json({ message: 'FAQ not found' });
            }
            res.json({ data: faq });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch FAQ', error: err.message });
        });
}

// Update FAQ by ID
exports.updateFAQById = (req, res) => {
    FAQSchema.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(updatedFAQ => {
            if (!updatedFAQ) {
                return res.status(404).json({ message: 'FAQ not found' });
            }
            res.json({ data: updatedFAQ });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to update FAQ', error: err.message });
        });
}

// Delete FAQ by ID
exports.deleteFAQById = (req, res) => {
    FAQSchema.findByIdAndDelete(req.params.id)
        .then(deletedFAQ => {
            if (!deletedFAQ) {
                return res.status(404).json({ message: 'FAQ not found' });
            }
            res.json({ data: 'FAQ deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Failed to delete FAQ', error: err.message });
        });
}
