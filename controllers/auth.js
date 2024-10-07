import { validationResult } from "express-validator";

import User from "../models/user.js";

export async function putSignUp(req, res, next) {
  try {
    const { errors } = validationResult(req);

    const isEmailExist = await User.findOne({ email: req.body.email });
    console.log(isEmailExist);

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
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      habitTokens: 0,
    });

    await newUser.save();

    return res.status(201).send(
      JSON.stringify({
        message: "User created successfully",
        statusCode: 201,
      })
    );
  } catch (error) {
    console.log(error);
  }
}
