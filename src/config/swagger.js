import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi, { serve } from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Product API",
            version: "1.0.0",
            description: "API documentation for Product management",
        }
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Local server"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    },
    security: [
        { bearerAuth: [] }
    ],
    // Nơi swagger-jsdoc sẽ quét các chú thích để tạo tài liệu API
    apis: ["./src/routes/*.js", "./src/models/*.js"], // Đường dẫn tới các file route và model để swagger-jsdoc quét các chú thích
}

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
    app.use('/api-docs', serve, swaggerUi.setup(swaggerSpec));
}