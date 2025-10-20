import express from 'express'
import { verifyToken } from '../middleware/auth.middleware.js';
import { createCategory, deleteCategoryById, getAllCategories, searchCategories, updateCategoryBySlug } from '../controller/categories.controller.js';
const router = express.Router();

// Nó là một mini app trong ứng dụng chính
// express.Router(): được dùng để tách cac route trong ứng dụng thành các module riêng biệt, 
// giúp tổ chức mã nguồn tốt hơn và dễ bảo trì hơn.


/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the category
 *         name:
 *           type: string
 *           description: The name of the category
 *         slug:
 *           type: string
 *           description: The slug of the category
 *         description:
 *           type: string
 *           description: The description of the category
 *         isActive:
 *           type: boolean
 *           description: Whether the category is active
 *         createdBy:
 *           type: string
 *           description: ID of user who created the category
 *         updatedBy:
 *           type: string
 *           description: ID of user who last updated the category
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the category was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the category was last updated
 *       example:
 *         _id: "64f8a1234567890abcdef123"
 *         name: "Electronics"
 *         slug: "electronics"
 *         description: "Electronic devices and accessories"
 *         isActive: true
 *         createdBy: "64f8a1234567890abcdef456"
 *         updatedBy: "64f8a1234567890abcdef456"
 *         createdAt: "2024-10-13T10:30:00.000Z"
 *         updatedAt: "2024-10-13T10:30:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for categories management
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve a list of all categories
 *     tags: [Categories] 
 *     responses:
 *       200:
 *         description: A list of categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 */
router.get('/', getAllCategories)

/**
 * @swagger
 * /api/categories/search:
 *   get:
 *     summary: Search and filter categories with pagination
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by category name
 *         example: "Electronics"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *         example: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Categories found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalItems:
 *                   type: integer
 *                   example: 50
 *                 itemsPerPage:
 *                   type: integer
 *                   example: 10
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 */
router.get('/search', searchCategories) // Tìm kiếm, lọc, phân trang

/**
 * @swagger
 * /api/categories/create:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the category
 *                 example: "Electronics"
 *               description:
 *                 type: string
 *                 description: The description of the category
 *                 example: "Electronic devices and accessories"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the category is active
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request - Missing required fields or category already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category name is required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/create', verifyToken, createCategory)

// router.put('/:id', verifyToken,)

/**
 * @swagger
 * /api/categories/{slug}:
 *   put:
 *     summary: Update a category by slug
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the category to update
 *         example: "electronics"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the category
 *                 example: "Smart Electronics"
 *               description:
 *                 type: string
 *                 description: The new description of the category
 *                 example: "Smart electronic devices and IoT products"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the category is active
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal server error
 */
router.put('/:slug', verifyToken, updateCategoryBySlug) // Cập nhập theo slugName

// router.get('/:id',)

// router.get('/:slug',) // Lấy thông tin chi tiết theo slugName

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to delete
 *         example: "64f8a1234567890abcdef123"
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 */
router.delete('/:id', verifyToken, deleteCategoryById)




// Thêm sản phẩm mới

export default router;


//Cast to ObjectId failed for value "search" (type string) at path "_id" for model "products"
// Lỗi trên xảy ra khi mình gọi API /api/products/search
// Nguyên nhân là do thứ tự khai báo route
// Khi mình khai báo route /:id trước /search thì khi gọi /search,
// Express sẽ hiểu "search" là giá trị của tham số id trong route /:id
// Vì "search" không phải là một ObjectId