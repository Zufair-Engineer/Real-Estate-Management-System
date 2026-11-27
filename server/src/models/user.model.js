import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "buyer", "agent", "admin"],
      default: "user",
    },

    avatar: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
    },

    phone: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
        type: String,
        select: false
    }
  },
  { timestamps: true }
);

// Hash Password Before Saving
userSchema.pre("save" , async function (){
    if(!this.isModified("password")) return ;

    this.password = await bcrypt.hash(this.password , 10);
})

// Compare Password During Login
userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password , this.password);
}

const User = mongoose.model("User", userSchema);

export default User;