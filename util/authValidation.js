import jwt from "jsonwebtoken";
import loadEnv from "./envConfig.js";

import User from "../models/user.js";

loadEnv();

export function generateToken(payload, cb) {
  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    (err, token) => {
      if (err) {
        console.log(err);
      }
      return cb({
        token: token,
        message: "Logged in",
        statusCode: 200,
      });
    }
  );
}

export function verifyToken(token, cb) {
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    try {
      if (err || !decoded) {
        return cb(false);
      }
      const findUser = await User.findOne({
        _id: decoded.id,
        email: decoded.email,
      });

      if (findUser) {
        return cb(findUser._id);
      }
      return cb(false);
    } catch (error) {
      console.log(error);
    }
  });
}
