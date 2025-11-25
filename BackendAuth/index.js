const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const Users = require("./Users");

const PORT = 4000;
const secret = process.env.SECRET_KEY;
const app = express();


mongoose
  .connect("mongodb://127.0.0.1:27017/authDB")
  .then(() => {
    console.log("Db connnected sucesfully");
  })
  .catch((err) => console.error("Error connecting the Database", err.message));

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

// rate limiter middleware function i.e from one ip under 1 min only 5 req are allowed
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // change this to lower number in production
  message: { message: "Too many login attempts. Try again later." },
});

// Centralized Auth Middleware
function verifyAccessToken(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }
  const token = authorization.split(" ")[1];
  // ["Bearer", "tokenvalue"] this is the format of authorization header that's why we use split(" ")[1] split by space and take the second part

  try {
    const decodedToken = jwt.verify(token, secret); // thiswill look like { id: 'id[mongodb_gen_ids]', scope: 'authToken', iat: timestamp, exp: timestamp }
    if (!decodedToken || decodedToken.scope !== "access") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = decodedToken.id; // sent to the route which will use this middleware
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}


app.use(
  cors({
    origin: "http://localhost:5173", // or whatever port your Vite frontend runs on
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());


// rate limit middleware on login and refresh toekn route
app.use("/login", loginLimiter);
app.use("/auth/refresh", loginLimiter);


// Get current user route implemented with token verification i.e no login required every time just use the token
app.get("/users-me", verifyAccessToken, async (req, res) => {
  const user = await Users.findById(req.userId); // this looks like Users.findOne({ _id: decodedToken.id }) made to userId via middleware
  if (!user) return res.status(401).json({ message: "User not found" });
  const { hashedPassword: _, ...safeUser } = user.toObject();
  res.json({ message: "User found", safeUser });
});

// Register user route
app.post("/users", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors });
  }

  const { name, email, password } = parsed.data;

  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await Users.create({
    name: name,
    email: email,
    hashedPassword: hashedPassword,
  });

  const { hashedPassword: _, ...safeUser } = newUser.toObject();
  res.status(201).json({ message: "User Created sucessfully", user: safeUser });
});

// Login user route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email: email });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign({ id: user._id, scope: "access" }, secret, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
  });

  const refreshToken = jwt.sign({ id: user._id, scope: "refresh" }, secret, {
    expiresIn: "7d",
  });

  // Set refresh token as secure httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // make it true for browser i.e production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const { hashedPassword, ...safeUser } = user.toObject();
  res.json({ message: "Login Sucessful", user: safeUser, accessToken });
});

// Refresh route
app.post("/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // read refresh token from cookie
  if (!refreshToken)
    return res.status(401).json({ message: "No Refresh token found!" });

  try {
    const decoded = jwt.verify(refreshToken, secret);

    if (decoded.scope !== "refresh") {
      return res.status(403).json({ message: "Invalid token scope" });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, scope: "access" },
      secret,
      {
        expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
      }
    );

    res.json({ message: "New acess token", accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});
