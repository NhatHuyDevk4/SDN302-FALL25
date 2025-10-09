import express from 'express'
import { verifyToken } from '../middleware/auth.middleware.js';
import { createProduct, deleteProductById, getAllProducts, getProductById, searchProducts, updateProductById } from '../controller/product.controller.js';
const router = express.Router();

// Nó là một mini app trong ứng dụng chính
// express.Router(): được dùng để tách cac route trong ứng dụng thành các module riêng biệt, 
// giúp tổ chức mã nguồn tốt hơn và dễ bảo trì hơn.

router.get('/', getAllProducts)

// Thêm sản phẩm mới
router.post('/create', verifyToken, createProduct)

// Search sản phẩm theo aplhabet
router.get('/search', searchProducts)


// Update sản phẩm theo id
router.put('/:id', verifyToken, updateProductById)

// Lấy thông tin chi tiết sản phẩm theo id
router.get('/:id', getProductById)

// Xóa sản phẩm theo id
router.delete('/:id', verifyToken, deleteProductById)



export default router;


//Cast to ObjectId failed for value "search" (type string) at path "_id" for model "products"
// Lỗi trên xảy ra khi mình gọi API /api/products/search
// Nguyên nhân là do thứ tự khai báo route
// Khi mình khai báo route /:id trước /search thì khi gọi /search,
// Express sẽ hiểu "search" là giá trị của tham số id trong route /:id
// Vì "search" không phải là một ObjectId