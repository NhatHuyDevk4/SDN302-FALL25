import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

// GET [/api/products]
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find() // Lấy tất cả sản phẩm trong database
        console.log('Products:', products);
        return res.status(200).json({ products: products });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// POST [/api/products/create]
export const createProduct = async (req, res) => {
    const { name, description, images, brand, category, price, discount, stock, tags, ratings } = req.body;
    try {
        if (!name || !description || !images || !brand || !category || !price || !stock) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const findCategory = await Category.find({ name: { $in: category } }); //$in là tìm trong mảng
        if (findCategory.length === 0) {
            return res.status(400).json({ message: 'Category not found' });
        }

        const categoryIds = findCategory.map(cat => cat._id); // Lấy mảng id của các category tìm được

        // Thêm sản phẩm vào database
        const newProduct = new Product({
            name,
            description,
            images,
            brand,
            category: categoryIds,
            price,
            discount,
            stock,
            tags,
            ratings,
            createdBy: req.user.userId // req.user được gán trong middleware verifyToken
        })
        await newProduct.save();
        return res.status(201).json({ message: 'Product created successfully', data: newProduct });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// GET [/api/products/:id]
export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ product: product });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// DELETE [/api/products/:id]
export const deleteProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id)
        console.log('Deleted Product:', product);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// PUT [/api/products/:id]
export const updateProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const { name, description, images, brand, category, price, discount, stock, tags, ratings } = req.body;

        const updateFields = {
            updateBy: req.user.userId // req.user được gán trong middleware verifyToken
        };

        if (name !== undefined) updateFields.name = name;
        if (description !== undefined) updateFields.description = description;
        if (images !== undefined) updateFields.images = images;
        if (brand !== undefined) updateFields.brand = brand;
        if (price !== undefined) updateFields.price = price;
        if (discount !== undefined) updateFields.discount = discount;
        if (stock !== undefined) updateFields.stock = stock;
        if (tags !== undefined) updateFields.tags = tags;
        if (ratings !== undefined) updateFields.ratings = ratings;

        // Xử lý category (Thay thế hoàn toàn)
        if (category && Array.isArray(category)) {
            // Tìm danh mục trong database
            const findCategory = await Category.find({ name: { $in: category } }); //$in là tìm trong mảng

            if (findCategory.length === 0) {
                return res.status(400).json({ message: 'Category not found' });
            }

            const categoryIds = findCategory.map(cat => cat._id); // Lấy mảng id của các category tìm được

            // Thay thế hoàn toàn danh sách category
            updateFields.category = categoryIds;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true } // Trả về document sau khi update
        ).populate('category', '_id name'); // populate để thay thế ObjectId trong category bằng document thực tế từ collection categories

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// GET [/api/products/search?name=abc]
export const searchProducts = async (req, res) => {
    try {
        const { title, page = 1, limit = 5 } = req.query;
        // title là từ khóa tìm kiếm,
        //  page là số trang hiện tại, mặc định là 1
        // limit là số sản phẩm trên mỗi trang


        const query = title ?
            { name: { $regex: title, $options: 'i' } } // Tìm theo tên, i là không phân biệt hoa thường
            :
            {};

        const skip = (page - 1) * limit; // Số sản phẩm bỏ qua để đến trang hiện tại
        // Giả sử mình có 20 sản phẩm và mình chỉ muốn hiển thị 5 sản phẩm mỗi trang (limit = 5)
        // Trang 1: skip = (1 - 1) * 5 = 0 => Lấy từ sản phẩm thứ 0 đến sản phẩm thứ 4
        // Trang 2: skip = (2 - 1) * 5 = 5 => Lấy từ sản phẩm thứ 5 đến sản phẩm thứ 9

        // Lấy sản phẩm và tổng số luuowngk
        const [products, total] = await Promise.all([
            Product.find(query).skip(skip).limit(Number(limit)), // Lấy sản phẩm theo trang
            Product.countDocuments(query) // Đếm tổng số sản phẩm
        ])

        // Tính tổng số trang
        const totalPages = Math.ceil(total / limit); // Ra số trang và làm tròn lên
        // Ví dụ: total = 120, limit = 10 => total/limit = 120 / 10 = 12 => totalPages = 12


        return res.status(200).json({
            success: true,
            currentPage: Number(page), // Trang hiện tại
            totalPages: totalPages, // Tổng số trang
            totalItems: total, // Tổng số sản phẩm
            itemsPerPage: Number(limit), // Số sản phẩm trên mỗi trang
            products: products  // Danh sách sản phẩm
        })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}