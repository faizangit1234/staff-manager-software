const asyncHandler = require("express-async-handler");
const User = require("../models/user.models.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { transporter } = require("../config/nodeMailer.js");

//@desc get all users
//@route /api/v1/users/
//@private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.send(users);
});

//@desc post a user
//@route /api/v1/users/
//@public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("all fields are necessary");
  }
  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("email already exists");
  }
  const hashedPass = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPass,
    role,
  });
  if (!user) {
    res.status(400);
    throw new Error("invalid fields");
  }
  const html = `
  <h1>Welcome, ${name}!</h1>
  <p>Thanks for registering at Kashmir Luxury Escapes.</p>
`;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Hello user, you are welcome",
      html,
    });
  } catch (error) {
    console.error("Email failed:", error.message);
  }
  res.send({
    message: "user created successfully",
    user: {
      name: user.name,
      email: user.email,
      role: role,
    },
  });
});

//@desc login a user
//@route /api/v1/users/login
//@public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("all fields are mandatory");
  }
  if (!(await User.findOne({ email }))) {
    throw new Error("email does not exist");
  }
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        email: user.email,
        name: user.name,
        id: user._id,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "120m" },
    );

    //   const html = `
    //   <h1>Welcome, ${email}!</h1>
    //   <p>Thanks for registering at Kashmir Luxury Escapes.</p>
    // `;

    //in future if we will have multiple users
    // try {
    //   await transporter.mailer.sendMail({
    //     from: process.env.MAIL_USER,
    //     to: email,
    //     subject: "Hello user, you are welcome",
    //     html,
    //   });
    // } catch (error) {
    //   console.error("Email failed:", error.message);
    // }
    res.status(200).json({
      message: "login successfully",
      accessToken: accessToken,
      accessTokenExpiresIn: 120,
    });
  }
});

//@desc get a user
//@route /api/v1/users/:id
//@access private
const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new Error("id is must");
  }
  const user = await User.findById(id);
  if (!user) {
    throw new Error("user not found");
  }
  res.send(user);
});

//@desc update a user
//@route /api/v1/users/:id
//@public
const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new Error("id is must");
  }
  const user = await User.findById(id);
  if (!user) {
    throw new Error("user not found");
  }
  const Updateduser = await User.findByIdAndUpdate(id, req.body, { new: true });
  res.send(Updateduser);
});

//@desc delete a user
//@route /api/v1/users/:id
//@public
const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new Error("id is must");
  }
  const user = await User.findById(id);
  if (!user) {
    throw new Error("user not found");
  }
  const deleteduser = await user.deleteOne();
  res.send(deleteduser);
});

//@desc delete all users
//@route Delete /api/v1/users/delete
//@private
const deleteAllUsers = asyncHandler(async (req, res) => {
  const success = await User.deleteMany({});
  if (!success) {
    throw new Error("failed");
  }
  res.send("success");
});

module.exports = {
  getAllUsers,
  getUser,
  register,
  login,
  updateUser,
  deleteUser,
  deleteAllUsers,
};
