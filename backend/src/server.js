import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = await mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
    },
    { timestamps: true },
);

const User = mongoose.model("User", userSchema);

app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: "error",
                message: "Username and password are required.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: "error",
                message: "Password must be at least 8 characters.",
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({
                status: "error",
                message: "Username already exists.",
            });
        }

        const user = await User.create({
            username,
            password,
        });

        return res.status(201).json({
            status: "success",
            message: "User created successfully.",
            data: {
                id: user._id,
                username: user.username,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});

app.listen(process.env.PORT, () => {
    console.log("Connected to MongoDB:", connection.connection.host);
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
