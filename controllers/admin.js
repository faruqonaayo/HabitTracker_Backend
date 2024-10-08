import { validationResult } from "express-validator";

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

export async function putHabit(req, res, next) {
  try {
    const { errors } = validationResult(req);
    // console.log(errors);

    if (errors.length > 0) {
      return res
        .status(422)
        .send(JSON.stringify({ message: errors[0].msg, statusCode: 422 }));
    } else if (req.headers.authorization) {
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
          const newHabit = {
            title: req.body.title,
            startTime: req.body.start,
            endTime: req.body.end,
          };

          const isHabitExist = isUserExist.habits.filter(
            (habit) =>
              habit.title.toLowerCase() === req.body.title.toLowerCase()
          );
          // check if habit with the name already exists
          if (isHabitExist.length > 0) {
            return res.status(422).send(
              JSON.stringify({
                message: "Habit already exists",
                statusCode: 422,
              })
            );
          }

          // check if the user has enough habit tokens
          if (isUserExist.habitTokens < 10000) {
            return res.status(422).send(
              JSON.stringify({
                message: "Insufficient habit tokens",
                statusCode: 422,
              })
            );
          }

          // if all checks pass, add the new habit to the user's habits array
          isUserExist.habits.push(newHabit);
          isUserExist.habitTokens -= 10000;
          await isUserExist.save();

          return res.status(200).send(
            JSON.stringify({
              message: "Added new habit successfully",
              statusCode: 200,
            })
          );
        }
      });
    }
  } catch (error) {}

  // res.status(200).send(JSON.stringify({ message: "Success", statusCode: 200 }));
}
