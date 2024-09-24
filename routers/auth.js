const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models/index").user;
const jwt = require("jsonwebtoken");
router.use((req, res, next) => {
  console.log("正在通過router middleware...");
  next();
});
//查詢所有註冊者
router.get("/user", async (req, res) => {
  let allUser = await User.find({}).exec();
  res.send(allUser);
});

//註冊使用者
router.post("/register", async (req, res) => {
  //確認註冊資料是否符合規範
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //確認信箱是否被使用過
  let exsistEmail = await User.findOne({ email: req.body.email });
  if (exsistEmail) {
    return res.status(400).send("此信箱已被註冊過...請嘗試使用其他信箱");
  } else {
    try {
      let { username, email, password, role } = req.body;
      let newUser = new User({ username, email, password, role });
      let result = await newUser.save(); //此處會使用userSchema.pre將秘買進行雜湊處理
      return res.send({
        message: "註冊成功!",
        result,
      });
    } catch (e) {
      res.status(500).send({ message: "註冊失敗", e });
    }
  }
});
//登入使用者
router.post("/login", async (req, res) => {
  //確認登入資料是否符合規範
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //確認信箱是否被使用過
  let foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(401).send("找不到此信箱。請確認信箱是否正確。");
  }

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);
    if (isMatch) {
      //製作JWT
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "登入成功",
        token: "JWT " + token, //JWT後方一定要空格否則會出現bug
        user: foundUser,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

module.exports = router;
