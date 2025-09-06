const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity:{
    type:Number,
    require:true.valueOf,
    default:1
  },
  slug: {
    type: String,
    required: false,
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
  // stoneType: {
  //   type: String,
  //   required: true,
  //   trim: true
  // },
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

// Pre-save middleware to generate slug
productSchema.pre('save', async function(next) {
  if (!this.slug && this.isModified('name')) {
    // Generate slug from name
    const generateSlug = (text) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

    let slug = generateSlug(this.name);
    
    // Check if slug already exists and make it unique if necessary
    let slugExists = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
    let counter = 1;
    const originalSlug = slug;
    
    while (slugExists) {
      slug = `${originalSlug}-${counter}`;
      slugExists = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);