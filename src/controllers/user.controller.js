import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  //validation -  not empty
  //check is user already exists through email, username
  //check for images, check for avatar
  //upload to them cloudinary , avatar
  // create user object - create entry in db
  // remove password and refreshtoken field from response
  //check for user creation
  // return response
  const { email, fullName, username, password } = req.body;
  console.log(
    "email: ",
    email,
    "fullName:",
    fullName,
    "username:",
    username,
    "password:",
    password
  );

  if (
    [email, fullName, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are Required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists!!");
  }
});

export default registerUser;
