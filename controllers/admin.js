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
    } else {
      return res.status(401).send(
        JSON.stringify({
          message: "Invalid Credentials",
          statusCode: 401,
        })
      );
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
            dateCompleted: [],
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
    } else {
      return res.status(401).send(
        JSON.stringify({
          message: "Invalid Credentials",
          statusCode: 401,
        })
      );
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getAllHabits(req, res, next) {
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

          // console.log(isUserExist.habits);
          const userResponse = isUserExist.habits.map((habit) => {
            const isHabitCompletedToday = habit.dateCompleted.filter(
              (date) =>
                date.toISOString().split("T")[0] ===
                new Date().toISOString().split("T")[0]
            );
            return {
              title: habit.title,
              startTime: habit.startTime,
              endTime: habit.endTime,
              isCompleted: isHabitCompletedToday.length > 0,
            };
          });
          // console.log(userResponse);

          return res.status(200).send(
            JSON.stringify({
              habits: userResponse,
              message: "Sucess fetching all habits",
              statusCode: 200,
            })
          );
        }
      });
    } else {
      return res.status(401).send(
        JSON.stringify({
          message: "Invalid Credentials",
          statusCode: 401,
        })
      );
    }
  } catch (error) {
    console.log();
  }
}

export async function checkHabit(req, res, next) {
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

          const updatedHabitsArray = isUserExist.habits.map((habit) => {
            if (habit.title.toLowerCase() === req.body.title.toLowerCase()) {
              const findDate = habit.dateCompleted.filter(
                (date) =>
                  date.toISOString().split("T")[0] ===
                  new Date().toISOString().split("T")[0]
              );
              if (findDate.length === 0) {
                habit.dateCompleted.push(new Date());
                isUserExist.habitTokens += 1500;
              } else {
                habit.dateCompleted = habit.dateCompleted.filter(
                  (date) =>
                    date.toISOString().split("T")[0] !==
                    new Date().toISOString().split("T")[0]
                );
                isUserExist.habitTokens -= 1500;
              }
            }
            return habit;
          });

          isUserExist.habits = updatedHabitsArray;
          console.log(isUserExist);
          await isUserExist.save();

          return res.status(200).send(
            JSON.stringify({
              message: "Checked habit successfully",
              statusCode: 200,
            })
          );
        }
      });
    } else {
      return res.status(401).send(
        JSON.stringify({
          message: "Invalid Credentials",
          statusCode: 401,
        })
      );
    }
  } catch (error) {}
}
