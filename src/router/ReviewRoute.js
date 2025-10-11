const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, markHelpful } = require('../controller/ReviewController');

router.get('/product/:productId', getProductReviews);
router.post('/create', createReview);
router.put('/helpful/:reviewId', markHelpful);

module.exports = router;