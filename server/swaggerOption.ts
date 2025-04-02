import swaggerJSDoc from "swagger-jsdoc";
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Ticket manager API",
    version: "1.0.0",
    description: "Ticket managment API Documentation",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  servers: [
    {
      url: "https://taskplanner-api.up.railway.app",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
