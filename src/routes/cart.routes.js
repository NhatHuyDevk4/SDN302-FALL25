import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { addItemToCart, clearCart, countCartItems, getCart, removeItemFromCart } from '../controller/cart.controller.js';


const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: "ID của sản phẩm."
 *         quantity:
 *           type: number
 *           description: "Số lượng sản phẩm."
 *           default: 1
 *         price:
 *           type: number
 *           description: "Giá của sản phẩm tại thời điểm thêm vào giỏ hàng."
 *       example:
 *         product: "60d0fe4f5311236168a109ca"
 *         quantity: 2
 *         price: 29.99
 *
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: "ID tự động tạo của giỏ hàng."
 *         user:
 *           type: string
 *           description: "ID của người dùng sở hữu giỏ hàng."
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalPrice:
 *           type: number
 *           description: "Tổng giá trị của giỏ hàng."
 *           default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "Thời gian tạo giỏ hàng."
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: "Thời gian cập nhật giỏ hàng lần cuối."
 *       example:
 *         id: "6151ae02a4b2a7645c81f1b3"
 *         user: "60d0fe4f5311236168a109cb"
 *         items:
 *           - product: "60d0fe4f5311236168a109ca"
 *             quantity: 2
 *             price: 29.99
 *           - product: "60d0fe4f5311236168a109d5"
 *             quantity: 1
 *             price: 99.99
 *         totalPrice: 159.97
 */

/**
 * @swagger
 * tags:
 *   - name: Carts
 *     description: "API quản lý giỏ hàng"
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Lấy giỏ hàng của người dùng hiện tại
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: "Lấy giỏ hàng thành công"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: "Unauthorized - Không có quyền truy cập"
 *       404:
 *         description: "Không tìm thấy giỏ hàng"
 *       500:
 *         description: "Lỗi máy chủ"
 */
router.get('/', verifyToken, getCart);

/**
 * @swagger
 * /api/cart/count:
 *   get:
 *     summary: Đếm số lượng sản phẩm trong giỏ hàng của người dùng hiện tại
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: "Số lượng sản phẩm trong giỏ hàng"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                   description: "Số lượng sản phẩm trong giỏ hàng"
 *               example:
 *                 count: 3
 *       401:
 *         description: "Unauthorized - Không có quyền truy cập"
 *       404:
 *         description: "Không tìm thấy giỏ hàng"
 */
router.get('/count', verifyToken, countCartItems)

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     tags: [Carts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *             required:
 *               - productId
 *               - quantity
 *             example:
 *               productId: "60d0fe4f5311236168a109ca"
 *               quantity: 1
 *     responses:
 *       200:
 *         description: Thêm sản phẩm thành công, trả về giỏ hàng đã cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: "Dữ liệu không hợp lệ (ví dụ: productId thiếu)"
 *       401:
 *         description: "Unauthorized - Không có quyền truy cập"
 *       404:
 *         description: "Không tìm thấy sản phẩm"
 *       500:
 *         description: "Lỗi máy chủ"
 */
router.post('/add', verifyToken, addItemToCart);


/**
 * @swagger
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Xóa một sản phẩm khỏi giỏ hàng
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: "ID của sản phẩm cần xóa"
 *     responses:
 *       200:
 *         description: "Xóa thành công, trả về giỏ hàng đã cập nhật"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: "Unauthorized"
 *       404:
 *         description: "Sản phẩm không có trong giỏ hàng"
 *       500:
 *         description: "Lỗi máy chủ"
 */
router.delete('/remove/:productId', verifyToken, removeItemFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Xóa tất cả sản phẩm khỏi giỏ hàng
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: "Giỏ hàng đã được xóa sạch"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Cart cleared successfully"
 *       401:
 *         description: "Unauthorized"
 *       500:
 *         description: "Lỗi máy chủ"
 */
router.delete('/clear', verifyToken, clearCart);

export default router;