const productSchema = require("../models/ProductModel");
const Category = require("../models/Category");
const ProductModel = require("../models/ProductModel");

const createProduct = async (req, res) => {
    try {
        // Handle both JSON and form-data
        const data = req.body || {};
        
        const {
            name,
            description,
            shortDescription,
            price,
            discountedPrice,
            stock,
            sku,
            category,
            stoneType,
            astrologicalBenefits,
            usage,
            certification,
            weight,
            dimensions,
            isActive,
            isFeatured,
            seoTitle,
            seoDescription,
            tags
        } = data;

        if (!name || !price || !sku) {
            return res.status(400).json({ message: "Name, price, and SKU are required." });
        }

        // Generate slug from name
        const generateSlug = (text) => {
            return text
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
                .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
        };

        let slug = generateSlug(name);
        
        // Check if slug already exists and make it unique if necessary
        let slugExists = await productSchema.findOne({ slug });
        let counter = 1;
        const originalSlug = slug;
        
        while (slugExists) {
            slug = `${originalSlug}-${counter}`;
            slugExists = await productSchema.findOne({ slug });
            counter++;
        }

        // Parse arrays from comma-separated strings (for form-data)
        const parsedBenefits = typeof astrologicalBenefits === 'string' 
            ? astrologicalBenefits.split(',').map(item => item.trim())
            : astrologicalBenefits;
            
        const parsedTags = typeof tags === 'string'
            ? tags.split(',').map(item => item.trim())
            : tags;

        const productAdd = await productSchema.create({
            name,
            slug, // Add the generated slug
            description,
            shortDescription,
            price: Number(price),
            discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
            stock: Number(stock),
            sku,
            category,
            stoneType,
            astrologicalBenefits: parsedBenefits,
            usage,
            certification,
            weight: weight ? Number(weight) : undefined,
            dimensions,
            isActive: isActive === 'true' || isActive === true,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            seoTitle,
            seoDescription,
            tags: parsedTags
        });

        res.status(201).json({
            message: "Product created successfully",
            product: productAdd
        });

    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            message: "Server error while creating product",
            error: error.message
        });
    }
};// get all product

const getAllProduct = async (req, res) => {
    try {
        const { category } = req.query;
        
        let filter = {};

        if (category) {
    // Find category document by name
    const categoryDoc = await Category.findOne({ name: category });
    if (categoryDoc) {
        filter.category = categoryDoc._id;
    } else {
        return res.status(404).json({
            data: [],
            message: `No category found with name: ${category}`
        });
    }
}

        // Populate category name when fetching
        const products = await ProductModel.find(filter).populate("category", "name");

        if (products.length > 0) {
            res.status(200).json({
                data: products,
                message: category 
                    ? `Successfully got products for category: ${category}`
                    : "Successfully got all products"
            });
        } else {
            res.status(404).json({
                data: [],
                message: category 
                    ? `No products found for category: ${category}`
                    : "No products found"
            });
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            message: "Server error while fetching products",
            error: error.message
        });
    }
};

// delete product
const deleteProduct = async (req, res) => {
    const id = req.params.id;
    const deleteproduct = await productSchema.findByIdAndDelete(id)
    if (deleteproduct) {
        res.status(200).json({
            data: deleteproduct,
            message: 'product deleted Successfully'
        })
    }
    else {
        res.status(404).json({
            message: 'No such product found'
        })
    }
}

// update product
const updateProduct = async (req, res) => {

    const id = req.params.id;
    const updatedProduct = await productSchema.findByIdAndUpdate(id, req.body)
    if (updatedProduct) {
        res.status(201).json({
            data: updatedProduct,
            message: "product user Successfully"
        })
    }
    else {
        res.status(404).json({
            message: "No Such product Updated"
        })
    }
}

const getSingleProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productSchema.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      data: product,
      message: "Product fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

const getBestSellers = async (req, res) => {
    try {
        const bestSellers = await ProductModel.find({ 
            isFeatured: true, 
            isActive: true 
        })
        .populate("category", "name")
        .sort({ salesCount: -1 })
        .limit(8);

        res.status(200).json({
            data: bestSellers,
            message: "Best sellers fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching best sellers:", error);
        res.status(500).json({
            message: "Server error while fetching best sellers",
            error: error.message
        });
    }
};

module.exports = { 
    createProduct,
    getAllProduct,
    deleteProduct,
    getSingleProduct,
    updateProduct,
    getBestSellers


};
