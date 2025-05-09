const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  let token;
  const authToken = req.headers.authorization || req.headers.Authorization;
  if (!authToken) {
    throw new Error("private route");
  }
  if (authToken.startsWith("Bearer")) {
    token = authToken.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
      if (err) {
        throw new Error("invalid or expired token");
      }
      console.log(decode);
      req.user = decode;
      next();
    });
  } else {
    throw new Error("failed to verify token or internal server error");
  }
};

module.exports = validateToken;
