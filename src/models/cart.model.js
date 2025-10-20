import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products', // tham chiếu đến collection products
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
    },
    price: {
        type: Number, // Giá tại thời điểm thêm vào giỏ hàng (để không bị ảnh hưởng bởi thay đổi giá sau này)
        required: true,
    },
    discount: {
        type: Number, // Phần trăm giảm giá tại thời điểm thêm vào giỏ hàng
        required: false,
        default: 0,
    },
    finalPrice: {
        type: Number, // Giá sau khi áp dụng giảm giá
        required: false, // Sẽ được tính tự động
    }
},
    {
        _id: false // Không tạo trường _id riêng cho mỗi item trong cart
    }
)

// Middleware để tính toán finalPrice trước khi lưu
CartItemSchema.pre('validate', function () {
    if (this.price !== undefined && this.discount !== undefined) {
        this.finalPrice = this.price * (1 - (this.discount || 0) / 100);
    }
});

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        items: [CartItemSchema],
        totalItems: {
            type: Number,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        }
    }, {
    timestamps: true, // Thằng này sẽ tự động tạo 2 trường createdAt và updatedAt
}
)

// Middleware để tính toán tổng trước khi lưu
CartSchema.pre('save', function () {
    this.totalItems = this.items.length;
    this.totalPrice = this.items.reduce((total, item) => {
        // Đảm bảo finalPrice được tính toán nếu chưa có
        if (!item.finalPrice && item.price !== undefined) {
            item.finalPrice = item.price * (1 - (item.discount || 0) / 100);
        }
        return total + (item.finalPrice * item.quantity);
    }, 0);
});

const Cart = mongoose.model('carts', CartSchema)
export default Cart