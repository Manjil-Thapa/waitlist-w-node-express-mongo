// user schema with an email field
const mongoose = require("mongoose");
Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});
// auto-incrementing “position” property
UserSchema.plugin(AutoIncrement, { inc_field: "position" });

module.exports = mongoose.model("User", UserSchema);
