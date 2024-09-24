const mongoose = require("mongoose");
const { Schema } = mongoose;
const courseSchema = new Schema({
  id: { type: String },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectID, //ObjectID是mongoose給我們的primary key
    ref: "User", //連結到User
  },
  students: {
    type: [String],
    defualt: [],
  },
});

module.exports = mongoose.model("Course", courseSchema);
