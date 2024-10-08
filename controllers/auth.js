import bcrypt from "bcrypt";
import loadEnv from "../util/envConfig.js";
import { validationResult } from "express-validator";

import User from "../models/user.js";
import { generateToken, verifyToken } from "../util/authValidation.js";

loadEnv();

export async function putSignUp(req, res, next) {
  try {
    const { errors } = validationResult(req);

    const isEmailExist = await User.findOne({ email: req.body.email });
    // console.log(isEmailExist);

    if (errors.length > 0 || isEmailExist) {
      if (isEmailExist) {
        return res
          .status(400)
          .send(
            JSON.stringify({ message: "Email already exists", statusCode: 400 })
          );
      }
      return res
        .status(400)
        .send(JSON.stringify({ message: errors[0].msg, statusCode: 400 }));
    }

    //   console.log(req.body);
    bcrypt.hash(req.body.password, 12, async (err, hash) => {
      if (err) {
        console.log(err);
      }
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        habitTokens: 25000,
      });

      await newUser.save();

      return res.status(201).send(
        JSON.stringify({
          message: "User created successfully",
          statusCode: 201,
        })
      );
    });
  } catch (error) {
    console.log(error);
  }
}

export async function postLogin(req, res, next) {
  try {
    //  check if the request header has an authorization property
    if (req.headers.authorization) {
      const token = req.headers.authorization.split("=")[1];
      verifyToken(token, (result) => {
        if (!result) {
          return res.status(401).send(
            JSON.stringify({
              message: "Invalid Credentials",
              statusCode: 401,
            })
          );
        } else {
          return res.status(200).send(
            JSON.stringify({
              token: token,
              message: "Logged in",
              statusCode: 200,
            })
          );
        }
      });
    } else if (!req.headers.authorization) {
      // if no authorization property in the request header the user is trying to login
      const isUserExist = await User.findOne({
        email: req.body.email,
      });

      if (!isUserExist) {
        return res.status(401).send(
          JSON.stringify({
            message: "No such email",
            statusCode: 401,
          })
        );
      }
      bcrypt.compare(req.body.password, isUserExist.password, (err, equal) => {
        if (err) {
          console.log(err);
        }

        if (equal) {
          generateToken(
            {
              id: isUserExist._id,
              email: isUserExist.email,
            },
            (result) => {
              return res.status(result.statusCode).send(JSON.stringify(result));
            }
          );
        } else {
          return res.status(401).send(
            JSON.stringify({
              message: "Invalid Password or Email",
              statusCode: 401,
            })
          );
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}
