import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
    createProduct,
    deleteProductById,
    getAllProducts,
    getProductById,
    searchProducts,
    updateProductById,
} from '../controller/product.controller.js';
const router = express.Router();

// Nó là một mini app trong ứng dụng chính
// express.Router(): được dùng để tách cac route trong ứng dụng thành các module riêng biệt,
// giúp tổ chức mã nguồn tốt hơn và dễ bảo trì hơn.

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         imageUrl:
 *           type: string
 *           description: The URL of the product image
 *       example:
 *         id: 60d0fe4f5311236168a109ca
 *         name: "Awesome T-Shirt"
 *         description: "A very comfortable and stylish t-shirt."
 *         price: 29.99
 *         imageUrl: "https://example.com/images/t-shirt.jpg"
 */

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: The products managing API
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách các sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products/create:
 *   post:
 *     summary: Tạo một sản phẩm mới
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *           example:
 *             name: "New Gadget"
 *             description: "The latest and greatest gadget."
 *             price: 99.99
 *             imageUrl: "https://example.com/images/gadget.jpg"
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized - Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/create', verifyToken, createProduct);

// Đặt route '/search' trước '/:id' để tránh lỗi "Cast to ObjectId"
// Khi gọi /api/products/search, Express sẽ không nhầm "search" là một ID.
/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Tìm kiếm sản phẩm theo tên
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Tên sản phẩm cần tìm kiếm
 *     responses:
 *       200:
 *         description: Danh sách các sản phẩm phù hợp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm nào
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/search', searchProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm theo ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *           example:
 *             name: "Updated Gadget"
 *             price: 109.99
 *     responses:
 *       200:
 *         description: Cập nhật sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized - Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/:id', verifyToken, updateProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Thông tin chi tiết sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Xóa sản phẩm thành công
 *       401:
 *         description: Unauthorized - Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete('/:id', verifyToken, deleteProductById);

export default router;