const productSchema = require("../models/ProductModel");

const createProduct = async (req, res) => {
    try {
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
        } = req.body;


        if (!name || !price || !sku) {
            return res.status(400).json({ message: "Name, price, and SKU are required." });
        }
        const productAdd = await productSchema.create({
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
};


// get all product
const getAllProduct = async (req, res) => {

    const product = await productSchema.find()
    // const product = await productSchema.find().populate("category")----not working ples chek 

    if (product) {
        res.status(201).json({
            data: product,
            message: "Successfully got all the Product"
        })
    }
    else {
        res.status(404).json({
            message: "No Product found"
        })
    }
}

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

module.exports = { 
    createProduct,
    getAllProduct,
    deleteProduct,
    getSingleProduct,
    updateProduct


};
