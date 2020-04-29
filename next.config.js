// must restart server whenever you make changes in next.config
module.exports = {
  env: {
    MONGO_SRV: "mongodb+srv://example:examplePass@reactreserve-wake7.mongodb.net/test?retryWrites=true&w=majority",
    JWT_SECRET: "jfdsklajfklsdjfklsdajl",
    CLOUDINARY_URL: "https://api.cloudinary.com/v1_1/reactreserveanshulmodh/image/upload",
    STRIPE_SECRET_KEY: "<insert-stripe-secret-key>"
  }
};
