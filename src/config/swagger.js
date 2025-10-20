import swaggerJSDoc from "swagger-jsdoc";
// Dùng để sunh OpenAPI specification từ các chú thích trong code
// OpenAPI specification: định dạng chuẩn để mô tả API, giúp tạo tài liệu tự động và công cụ tương tác
import swaggerUi, { serve } from "swagger-ui-express";

const options = {
    definition: { // Mô tả chung về API
        openapi: "3.0.0", // Phiên bản OpenAPI
        info: { // Thông tin về API
            title: "Product API",
            version: "1.0.0",
            description: "API documentation for Product management",
        },
        servers: [ // Danh sách các server cung cấp API
            {
                url: "http://localhost:3000",
                description: "Local server"
            },
            {
                url: 'sdn-302-fall-25.vercel.app',
                description: "Production server"
            }
        ],
        components: { // Định nghĩa các thành phần tái sử dụng trong tài liệu API
            securitySchemes: { // Cơ chế bảo mật
                bearerAuth: { // Sử dụng Bearer token (JWT)
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            { bearerAuth: [] }
        ]
    },
    // Nơi swagger-jsdoc sẽ quét các chú thích để tạo tài liệu API
    apis: ["./src/routes/*.js", "./src/models/*.js"], // Đường dẫn tới các file route và model để swagger-jsdoc quét các chú thích
}

const swaggerSpec = swaggerJSDoc(options); // Tạo tài liệu OpenAPI từ các chú thích trong code

export const setupSwagger = (app) => {
    app.use('/api-docs', serve, swaggerUi.setup(swaggerSpec)); // Thiết lập route /api-docs để phục vụ giao diện Swagger UI
}