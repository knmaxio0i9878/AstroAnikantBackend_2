const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  images: [{
    url: {
      type: String,
    //   required: true
    },
    alt: {
      type: String
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  stoneType: {
    type: String,
    required: true,
    trim: true
  },
  astrologicalBenefits: [{
    type: String,
    trim: true
  }],
  usage: {
    type: String,
    trim: true
  },
  certification: {
    type: String,
    trim: true
  },
  weight: {
    value: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['grams', 'carats', 'kg'],
      default: 'grams'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['mm', 'cm', 'inches'],
      default: 'mm'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  salesCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  seoTitle: {
    type: String
  },
  seoDescription: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});


module.exports = mongoose.model('Product', productSchema);
