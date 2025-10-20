import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";


export const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.findOne({ user: userId }).populate('items.product'); // Populate để lấy thông tin chi tiết của sản phẩm trong giỏ hàng

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        return res.status(200).json({ data: cart });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const addItemToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity = 1 } = req.body;

        if (!productId || !userId) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Tính giá cuối cùng tại thời điểm thêm vào giỏ hàng
        const finalPrice = product.price * (1 - (product.discount || 0) / 100);

        // Tìm giỏ hàng của người dùng
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Tạo mới giỏ hàng nếu chưa có
            cart = new Cart({
                user: userId,
                items: [
                    {
                        product: productId,
                        quantity: quantity,
                        price: product.price,
                        discount: product.discount || 0,
                        finalPrice: finalPrice,
                    }
                ],
                totalItems: 1,
                totalPrice: finalPrice * quantity,
            })
        } else {
            // Nếu đã có giỏ hàng, kiểm tra sản phẩm đã tồn tại trong giỏ hay chưa
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

            if (itemIndex > -1) {
                // Nếu sản phẩm đã tồn tại, cập nhật số lượng
                cart.items[itemIndex].quantity += quantity;
                cart.items[itemIndex].price = product.price;
                cart.items[itemIndex].discount = product.discount || 0;
                cart.items[itemIndex].finalPrice = finalPrice;
            } else {
                cart.items.push({
                    product: productId,
                    quantity: quantity,
                    price: product.price,
                    discount: product.discount || 0,
                    finalPrice: finalPrice,
                })
            }

            // Cập nhật tổng giá trị giỏ hàng
            cart.totalItems = cart.items.length;
            cart.totalPrice = cart.items.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
        }

        await cart.save();

        return res.status(200).json({ message: 'Item added to cart successfully', data: cart });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const countCartItems = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        const uniqueProductIds = new Set(cart.items.map(item => item.product.toString()));
        // Set s sẽ tự động loại bỏ các giá trị trùng lặp, do đó ta có thể đếm số lượng sản phẩm duy nhất trong giỏ hàng.
        // Đếm số lượng sản phẩm duy nhất trong giỏ hàng
        // const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        // Hoặc nếu bạn muốn đếm số lượng sản phẩm duy nhất (không tính số lượng)
        const itemCount = uniqueProductIds.size;

        // Hoặc nếu bạn muốn đếm số lượng sản phẩm trong giỏ hàng (tổng số lượng)
        // const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);


        return res.status(200).json({ itemCount });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const removeItemFromCart = async (req, res) => {
    res.send('Remove item from cart');
}

export const clearCart = async (req, res) => {
    res.send('Clear cart');
}