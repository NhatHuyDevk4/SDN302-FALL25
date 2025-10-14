import Category from "../models/category.model.js";
import slugify from "slugify";

// [GET] /api/categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActvie: true }); // Lấy tất cả category trong database
        return res.status(200).json({ data: categories });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [GET] /api/categories/search
export const searchCategories = async (req, res) => {
    try {
        const { title, page = 1, limit = 5, isActive, sortField = "createdAt", sortOrder = "DESC" } = req.query;
        const query = {};
        // Lọc theo trạng thái isActive
        if (isActive !== undefined) {
            query.isActvie = isActive === 'true'; // Chuyển chuỗi 'true' hoặc 'false' thành boolean
        }
        // Tìm kiếm theo tên hoặc slug
        if (title) {
            query.$or = [ //$or là toán tử logic "hoặc" trong MongoDB
                { name: { $regex: title, $options: 'i' } }, // Tìm theo tên, i là không phân biệt hoa thường
                { slug: { $regex: title, $options: 'i' } }  // Tìm theo slug
            ];
        }
        // Xử lý sắp xếp
        const sortOptions = {
            [sortField]: sortOrder.toUpperCase() === 'ASC' ? 1 : -1 // 1 là tăng dần, -1 là giảm dần [sortField] là cú pháp để đặt tên key động trong object
        };

        const skip = (page - 1) * limit; // Số sản phẩm bỏ qua để đến trang hiện tại
        // Giả sử mình có 20 sản phẩm và mình chỉ muốn hiển thị 5 sản phẩm mỗi trang (limit = 5)
        // Trang 1: skip = (1 - 1) * 5 = 0 => Lấy từ sản phẩm thứ 0 đến sản phẩm thứ 4
        // Trang 2: skip = (2 - 1) * 5 = 5 => Lấy từ sản phẩm thứ 5 đến sản phẩm thứ 9

        // Lấy sản phẩm và tổng số luuowngk
        const [category, total] = await Promise.all([
            Category.find(query).sort(sortOptions).skip(skip).limit(Number(limit)), // Lấy sản phẩm theo trang
            Category.countDocuments(query) // Đếm tổng số sản phẩm
        ])

        // Tính tổng số trang
        const totalPages = Math.ceil(total / limit); // Ra số trang và làm tròn lên
        // Ví dụ: total = 120, limit = 10 => total/limit = 120 / 10 = 12 => totalPages = 12


        return res.status(200).json({
            success: true,
            pagination: {
                currentPage: Number(page), // Trang hiện tại
                totalPages: totalPages, // Tổng số trang
                totalItems: total, // Tổng số sản phẩm
                itemsPerPage: Number(limit), // Số sản phẩm trên mỗi trang
            },
            filters: {
                isActive: isActive,
                title: title || '',
                sortField,
                sortOrder
            },
            data: category  // Danh sách sản phẩm
        })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [POST] /api/categories/create
export const createCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Tạo slug từ name
        const slug = slugify(name, { lower: true, strict: true }); // strict: true để loại bỏ ký tự đặc biệt

        // // Kiểm tra xem category đã tồn tại chưa
        // const existingCategory = await Category.findOne({ name: name });
        // if (existingCategory) {
        //     return res.status(400).json({ message: 'Category name already exists' });
        // }

        // // Kiểm tra trùng slug
        // const existingSlug = await Category.findOne({ slug: slug });
        // if (existingSlug) {
        //     return res.status(400).json({ message: 'Category slug already exists' });
        // }

        const existingCategoryAndSlug = await Category.findOne({ $or: [{ name: name }, { slug: slug }] });
        if (existingCategoryAndSlug) {
            return res.status(400).json({ message: 'Category name or slug already exists' });
        }

        const newCategory = new Category({
            name,
            slug,
            description,
            isActive,
            createdBy: req.user.userId // req.user được gán trong middleware verifyToken
        })

        await newCategory.save();
        return res.status(201).json({ message: 'Category created successfully', data: newCategory });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [PUT] /api/categories/:slug
export const updateCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { name, description, isActive } = req.body;

        const category = await Category.findOne({ slug: slug });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Nếu người dùng cập nhật name thì mình phải cập nhật lại slug
        if (name) {
            category.name = name;
            category.slug = slugify(name, { lower: true, strict: true });
        }

        if (description !== undefined) {
            category.description = description;
        }

        if (isActive !== undefined) {
            category.isActive = isActive;
        }

        category.updatedBy = req.user.userId; // req.user được gán trong middleware verifyToken

        await category.save();
        return res.status(200).json({ message: 'Category updated successfully', data: category });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [DELETE] /api/categories/:id
export const deleteCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}