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

UserSchema.plugin(AutoIncrement, { in_field: "position" });

module.exports = mongoose.model("User", UserSchema);
