const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, markHelpful, getAllReviews, deleteReview } = require('../controller/ReviewController');

router.get('/product/:productId', getProductReviews);
router.post('/create', createReview);
router.put('/helpful/:reviewId', markHelpful);
router.get('/all', getAllReviews);
router.delete('/delete/:reviewId', deleteReview);

module.exports = router;