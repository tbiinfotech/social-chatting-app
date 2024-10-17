const jwt = require("jsonwebtoken");
const User = require("../Services/models/users");

function authorize() {
  return [
    async (req, res, next) => {


      console.log(req.headers)

      const tokenString = req.headers.authorization;
      if (!tokenString) {
        return res.json({
          status: 401,
          success: false,
          message: "unauthorized access",
        });
      }

      let token = req.headers.authorization.split(" ")[1];
      // console.log('authorize',token)
      try {
        let decoded = jwt.verify(token, process.env.jwt_token_key);
        req.user = { id: decoded.user_id, role: decoded.role };
        const user = await User.findById(decoded.user_id);
        if (!user) {
          return res.json({
            status: 401,
            success: false,
            message: "unauthorized access",
          });
        }

        // req.login_user = user.get();
        next();
      } catch (error) {
        return res.json({
          status: 401,
          success: false,
          message: "unauthorized access",
        });
      }
    },
  ];
}

module.exports = authorize;
