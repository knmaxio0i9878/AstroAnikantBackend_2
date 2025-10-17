const Review = require('../models/ReviewModel');
const Product = require('../models/ProductModel');

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a review
// Create a review
exports.createReview = async (req, res) => {
  try {
    const { product, user, rating, comment } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product, user });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = await Review.create({
      product,
      user,
      rating,
      comment
    });

    // Update product average rating
    await updateProductRating(product);

    const populatedReview = await Review.findById(review._id).populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedReview,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update helpful count
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    ).populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a review (Admin only)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.reviewId);

    // Update product average rating after deletion
    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all reviews (Admin only)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to update product average rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      averageRating: avgRating.toFixed(1)
    });
  }
}