import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { databaseConnection } from './src/config/database.js'
import authRouter from './src/routes/auth-routes.routes.js'
import profileRouter from './src/routes/profile.routes.js';
import productRouter from './src/routes/product.routes.js';
import categoryRouter from './src/routes/categories.routes.js';
import cartRouter from './src/routes/cart.routes.js';
import { setupSwagger } from './src/config/swagger.js';
import { setupStaticSwagger } from './src/config/swagger-static.js';
const app = express()

dotenv.config();
// Gọi connect database
databaseConnection();
app.use(cookieParser())
app.use(express.json()) // middleware: hàm chạy giữa, xử lý dữ liệu gửi lên server
app.use(bodyParser.urlencoded({ extended: true })); // xử lý dữ liệu từ form gửi lên

app.use(cors({
    origin: '*', // Cho phép domain này truy cập vào server
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Cho phép các phương thức này
    credentials: true // Cho phép gửi cookie
}))


// Thiết lập Swagger
try {
    setupSwagger(app);
    console.log('Dynamic Swagger setup successful');
} catch (error) {
    console.error('Dynamic Swagger failed, using static version:', error.message);
    setupStaticSwagger(app);
}

// Root route for testing
app.get('/', (req, res) => {
    res.json({
        message: 'SDN302 API is running!',
        swagger: '/api-docs',
        endpoints: {
            auth: '/api/auth',
            profile: '/api/profile',
            products: '/api/products',
            categories: '/api/categories',
            cart: '/api/cart'
        }
    });
});

app.use('/api/auth', authRouter) // Mục đính phục cho riêng authentication
app.use('/api/profile', profileRouter) // Mục đính phục cho riêng profile
app.use('/api/products', productRouter) // Mục đính phục cho riêng product
app.use('/api/categories', categoryRouter) // Mục đính phục cho riêng category
app.use('/api/cart', cartRouter) // Mục đính phục cho riêng cart

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


// MongoDB connection string should be in .env file for security
// ctrl + / : comment code
// MongoDB: NoSQL database
// mongoose: thư viện giúp kết nối và thao tác với MongoDB dễ dàng hơn


// MVC pattern: Model - View - Controller
// Model: định nghĩa cấu trúc dữ liệu, tương tác với database
// View: giao diện người dùng, hiển thị dữ liệu
// Controller: xử lý logic ứng dụng, nhận yêu cầu từ client, tương tác với model và trả về view