import swaggerJSDoc from "swagger-jsdoc";
// Dùng để sunh OpenAPI specification từ các chú thích trong code
// OpenAPI specification: định dạng chuẩn để mô tả API, giúp tạo tài liệu tự động và công cụ tương tác
import swaggerUi, { serve } from "swagger-ui-express";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
                url: 'https://sdn-302-fall-25.vercel.app',
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
    apis: [
        path.join(__dirname, '../routes/*.js'),
        path.join(__dirname, '../models/*.js'),
        // Fallback paths for different deployment environments
        "./src/routes/*.js",
        "./src/models/*.js",
        "src/routes/*.js",
        "src/models/*.js"
    ], // Đường dẫn tới các file route và model để swagger-jsdoc quét các chú thích
}

const swaggerSpec = swaggerJSDoc(options); // Tạo tài liệu OpenAPI từ các chú thích trong code

const outputDir = path.join(__dirname, '../public');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

// Debug: log the generated spec to check if it's working
console.log('Swagger spec generated:', Object.keys(swaggerSpec));
console.log('Number of paths found:', Object.keys(swaggerSpec.paths || {}).length);

export const setupSwagger = (app) => {
    // Swagger UI options
    const swaggerOptions = {
        explorer: true,
        swaggerOptions: {
            validatorUrl: null
        }
    };

    app.use('/api-docs', serve, swaggerUi.setup(swaggerSpec, swaggerOptions)); // Thiết lập route /api-docs để phục vụ giao diện Swagger UI

    // Also provide JSON endpoint for the swagger spec
    app.get('/swagger.json', (req, res) => {
        res.json(swaggerSpec);
    });
}