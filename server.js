const express = require("express");
const app = express();
require("dotenv").config();
const passport = require("passport");
const authRoutes = require("./routers").auth;
const courseRoutes = require("./routers").course;
const mongoose = require("mongoose");
require("./config/passport")(passport); //passport為參數
const cors = require("cors");
//連接MongoDB
mongoose
  .connect(process.env.PASSPORT_LOGIN_API)
  .then(() => {
    console.log("已成功連接mongoDB...");
  })
  .catch((e) => {
    console.log(e);
  });

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
//router middlewares
app.use("/auth", authRoutes);

//只有通過JWT驗證的用戶才能新增或註冊課程
//如果requset header內沒有JWT，則request 被視為 unauthorized
app.use(
  "/course",
  passport.authenticate("jwt", { session: false }),
  courseRoutes
);

//伺服器聆聽
app.listen(8080, () => {
  console.log("伺服器正在8080上運行...");
});
