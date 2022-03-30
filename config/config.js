const env_vars = {
  MONGO_IP: process.env.MONGO_IP || "mongo",
  MONGO_PORT: process.env.MONGO_PORT || "27017",
  MONGO_USER: process.env.MONGO_USER || "carlos",
  MONGO_PASSWORD: process.env.MONGO_PASSWORD || "thepasswordis",
};

export default env_vars;
