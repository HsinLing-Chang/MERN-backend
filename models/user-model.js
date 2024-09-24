const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
let { Schema } = mongoose;
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "instructor"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//instance methods
userSchema.methods.isStudent = function () {
  return this.role == "student";
};
userSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

//mongoose middlewares
//若使用者為新用戶，或正在更改密碼，則會將密碼進行雜湊處理
//不可使用arrow function 否則this無法被獲取
userSchema.pre("save", async function (next) {
  //this 代表mongoDB裡的document
  //若數據是全新的isNew = true
  //isModidied 會去檢查this.document裡的password是否被改過

  if (this.isNew || this.isModified("password")) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
