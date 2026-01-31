import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    avatar: {
      type: String,
      default: "",
    },
    // End-to-end encryption keys
    encryptionKeys: {
      privateKey: {
        type: String,
        required: true,
      },
      publicKey: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
