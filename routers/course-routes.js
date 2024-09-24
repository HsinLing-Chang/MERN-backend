const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("course route 正在接受request...");
  next();
});

//查詢所有courses
router.get("/", async (req, res) => {
  try {
    let courseAll = await Course.find({})
      //找到關於instructor的資料，想找的內容放陣列中
      //populate 是query object 才能使用的method
      .populate("instructor", ["username", "email", "password"]) //ref若沒填則找不到
      .exec();

    return res.send(courseAll);
  } catch (e) {
    console.log(e);
  }
});
//用id尋找課程
router.get("/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let foundCourse = await Course.findOne({ _id }).populate("instructor", [
      "email",
    ]);
    res.send(foundCourse);
  } catch (e) {
    res.status(500).send(e);
  }
});
//用學生id尋找註冊過的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let coursesFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

//用講師id尋找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  let coursesFound = await Course.find({
    instructor: _instructor_id, //用自己的id找自己的課程
  })
    .populate("instructor", ["username", "email"])
    .exec();

  return res.send(coursesFound);
});

//用課程名稱尋找課程
router.get("/findByName/:name", async (req, res) => {
  try {
    let { name } = req.params;
    let coursesFound = await Course.find({ title: name })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//發布課程
router.post("/", async (req, res) => {
  //確認數據符合規範
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //確認不是學生身分
  if (req.user.isStudent()) {
    return res
      .status(400)
      .send("只有講師才能發布課程。若您是講師，請使用講師帳號登入。");
  }
  //發布新課程
  let { title, description, price } = req.body;
  try {
    const newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id, //可用來確認之後更新與刪除課程是否為同一人
    });
    const savedCourse = await newCourse.save();
    return res.send({ msg: "課程創建成功!", savedCourse });
  } catch (e) {
    return res.status(500).send({ msg: "無法創建新課程" });
  }
});

//學生透過id註冊課程
router.post("/enroll/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id); //此處為使用者id
    await course.save();
    return res.send("已註冊成功");
  } catch (e) {
    return res.status(500).send(e);
  }
});

//更新課程

router.patch("/:_id", async (req, res) => {
  //更新內容符合規範
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //更新資料
  let { _id } = req.params;
  try {
    //若ID錯誤搜尋不到
    let foundCourse = await Course.findOne({ _id }).exec();
    if (!foundCourse) return res.status(400).send("找不到該課程");
    //使用者必須是發佈課程講師才能更新
    if (foundCourse.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({ message: "課程已更新成功!", updatedCourse });
    } else {
      res.status(403).send("非該課程講師，無法更新課程內容");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("無法更新課程");
  }
});

//刪除課程
router.delete("/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let foundCourse = await Course.findOne({ _id }).exec();
    if (!foundCourse) res.status(400).send("找不到此課程，請重新輸入");
    if (foundCourse.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id });
      res.send("成功刪除該課程");
    } else {
      res.status(403).send("非該課程講師，無法刪除課程");
    }
  } catch (e) {
    res.status(500).send("無法刪除該課程");
  }
});

module.exports = router;
