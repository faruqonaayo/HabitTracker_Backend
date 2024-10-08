import { verifyToken } from "../util/authValidation.js";
import User from "../models/user.js";

export function getAdminInfo(req, res, next) {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split("=")[1];
      verifyToken(token, async (result) => {
        if (!result) {
          return res.status(401).send(
            JSON.stringify({
              message: "Invalid Credentials",
              statusCode: 401,
            })
          );
        } else {
          const isUserExist = await User.findOne({ _id: result });

          return res.status(200).send(
            JSON.stringify({
              info: {
                firstName: isUserExist.firstName,
                habitTokens: isUserExist.habitTokens,
              },
              message: "Sucess",
              statusCode: 200,
            })
          );
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}
