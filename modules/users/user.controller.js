const UserModel = require("./user.model");
const { hashPassword, comparePassword } = require("../../utils/bcrypt");
const { mailer } = require("../../services/mailer");
const { signJWT, generateSixDigitToken } = require("../../utils/token");
const userModel = require("./user.model");

const create = (payload) => {
  return UserModel.create(payload);
};

const list = async (search, page = 1, limit = 3) => {
  const query = [];
  // Searching
  if (search?.name) {
    query.push({
      $match: {
        name: new RegExp(search.name, "gi"),
      },
    });
  }
  if (search?.role) {
    query.push({
      $match: {
        roles: [search.role],
      },
    });
  }
  // Sorting
  query.push({
    $sort: {
      createdAt: 1,
    },
  });
  // Pagination
  query.push(
    {
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],
        data: [
          {
            $skip: (+page - 1) * +limit,
          },
          {
            $limit: +limit,
          },
        ],
      },
    },
    {
      $addFields: {
        total: {
          $arrayElemAt: ["$metadata.total", 0],
        },
      },
    },
    {
      $project: {
        total: 1,
        data: 1,
      },
    },
    {
      $project: {
        "data.password": 0,
      },
    }
  );
  // return UserModel.find();
  const result = await UserModel.aggregate(query);
  return {
    data: result[0].data,
    total: result[0].total || 0,
    page: +page,
    limit: +limit,
  };
};

const getById = (_id) => {
  return UserModel.findOne({ _id });
};

const updateById = (_id, payload) => {
  return UserModel.updateOne({ _id }, payload);
};

const removeById = (_id) => {
  return UserModel.deleteOne({ _id });
};

const register = async (payload) => {
  const { password } = payload;
  if (!password) throw new Error("Password field is missing");
  // -> update req.body in controller as password => bcrypt(hash pw)
  payload.password = hashPassword(payload.password);
  // User create using the payload
  const user = await UserModel.create(payload);
  if (!user) throw new Error("User Registration Failed");
  // -> Send email to user about successful signup (optional)
  const mail = await mailer(
    user.email,
    "User Registration ✔",
    "User Registration Completed!!"
  );
  if (mail) return "User Registration Completed";
};

const login = async (payload) => {
  const { email, password } = payload;
  if (!email || !password) throw new Error("Email or Password is missing");
  // -> check if user exists in the system or not
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) throw new Error("User doesn't exist");
  // -> if user exist, get hashedPw from Database
  const { password: hashPw } = user;
  // -> compare user provided password with hashedPw
  const result = comparePassword(password, hashPw);
  // -> if result false, throw new Error("Email or Password mismatch")
  if (!result) throw new Error("Email or Password mismatch");
  // return access token
  const userPayload = { name: user.name, email: user.email, roles: user.roles };
  const token = signJWT(userPayload);
  return token;
};

const generateFPToken = async (payload) => {
  const { email } = payload;
  if (!email) throw new Error("Email not found");
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("User doesn't exist");
  // Generate OTP
  const token = generateSixDigitToken();
  // Store the OTP in the model
  await UserModel.updateOne({ _id: user._id }, { token });
  // send the OTP in the email
  await mailer(email, "Forget Password Token", `Your reset token is ${token}`);
  return "Token sent to email";
};

const verifyFPToken = async (payload) => {
  const { token, email, password } = payload;
  if (!token || !email || !password) throw new Error("Something is missing");
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("User doesn't exist");
  if (token !== user.token) throw new Error("Invalid Token");
  const updatedUser = await UserModel.updateOne(
    { email },
    { password: hashPassword(password), token: "" }
  );
  if (!updatedUser) throw new Error("Password update failed");
  return "Password changed successfully";
};

const resetPassword = async (payload) => {
  const { userId, password } = payload;
  if (!userId || !password) throw new Error("User or password missing");
  const user = await userModel.findOne({ _id: userId });
  if (!user) throw new Error("User not found");
  await UserModel.updateOne(
    { _id: user._id },
    { password: hashPassword(password) }
  );
  return "Password reset successfully";
};

const changePassword = async (payload) => {
  const { oldPassword, newPassword, userId } = payload;
  if (!oldPassword || !newPassword || !userId)
    throw new Error("Something is missing");
  const user = await userModel.findOne({ _id: userId }).select("+password");
  if (!user) throw new Error("User not found");
  const isValidOldPw = comparePassword(oldPassword, user.password);
  if (!isValidOldPw) throw new Error("Password didn't match");
  await UserModel.updateOne(
    { _id: user._id },
    { password: hashPassword(newPassword) }
  );
  return "Password Changed Successfully";
};

const getProfile = (userId) => {
  return UserModel.findOne({ _id: userId });
};

const updateProfile = async (userId, payload) => {
  const user = await UserModel.findOne({ _id: userId });
  if (!user) throw new Error("User not found");
  await UserModel.updateOne({ _id: user._id }, payload);
  return "Profile updated successfully";
};

module.exports = {
  create,
  list,
  getById,
  updateById,
  removeById,
  register,
  login,
  generateFPToken,
  verifyFPToken,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
};
