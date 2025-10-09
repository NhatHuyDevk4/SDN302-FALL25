import { generateAccessToken, generateRefreshToken } from "../middleware/jwt.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// [POST] /api/auth/signup
export const signupController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        // Phải mã hóa password trước khi lưu vào database
        const hashedPassword = await bcrypt.hash(password, 10); // 10 là số lần băm, càng cao thì càng an toàn nhưng tốn thời gian hơn
        const newUser = new User(
            {
                name: name,
                email: email,
                password: hashedPassword
            }
        );
        await newUser.save();
        return res.status(201).json({ success: true, message: 'User registered successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }

    // Logic đăng ký người dùng sẽ được xử lý ở đây
    // account, password, email, phone, address, name
}

// [POST] /api/auth/login
export const loginController = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Tạo JWT access token
        const accessToken = generateAccessToken(user, user.role);
        const refreshToken = generateRefreshToken(user);
        // Lưu refresh token vào database
        user.refreshToken = refreshToken;
        await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken }, { new: true });
        // { new: true } để trả về document đã được cập nhật
        // Lưu refresh token vào cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // chỉ cho phép truy cập cookie từ server
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        })

        // Signature: dùng để xác thực token, đảm bảo token không bị thay đổi
        return res.status(200).json(
            {
                success: true,
                message: 'Login successful',
                accessToken: accessToken,
                refreshToken: refreshToken,
                // user: {
                //     id: user._id,
                //     name: user.name,
                //     email: user.email
                // }
            }
        );
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [POST] /api/auth/logout
export const logoutController = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ message: 'No refresh token provided' });
        }


        const user = await User.findOne({ refreshToken })
        if (!user) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }
        console.log("user", user);
        console.log("user id", user._id);
        await User.findByIdAndUpdate(user._id, { refreshToken: null }, { new: true }); // new: true để trả về document đã được cập nhật
        res.clearCookie('refreshToken');
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [POST] /api/auth/refresh-token
export const refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }
    try {
        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token 1' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY_REFRESH);

        if (user._id.toString() !== decoded.userId) {
            return res.status(403).json({ message: 'Invalid refresh token 2' });
        }

        const newAccessToken = generateAccessToken(user, user.role);
        return res.status(200).json({ success: true, accessToken: newAccessToken });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [GET] /api/auth/current-user
export const getCurrentUser = async (req, res) => {
    console.log('User from token:', req.user); // req.user được gán trong middleware verifyToken
    const userId = req.user.userId;
    try {
        const user = await User.findById(userId).select('-password -refreshToken -__v'); // loại bỏ trường password và refreshToken khỏi kết quả
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user: user });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [POST] /api/auth/forgot-password
export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Tạo token đặt lại mật khẩu
        const resetToken = crypto.randomBytes(32).toString('hex'); // Tạo chuỗi ngẫu nhiên 32 bytes và chuyển thành chuỗi 
        const resetTokenExpires = Date.now() + 5 * 60 * 1000; // Token hết hạn sau 5 phút

        // Lưu token và thời gian hết hạn vào database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        // Gửi email chứa link đặt lại mật khẩu
        // Sử dụng dịch vụ email như SendGrid, Mailgun, AWS SES, ...
        // Nội dung email có thể là link đến trang đặt lại mật khẩu kèm theo token
        console.log(`Reset your password by clicking the link: ${resetUrl}`);
        return res.status(200).json({ message: 'Password reset link has been sent to your email:' + `${resetUrl}` });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// [POST] /api/auth/reset-password/:token
export const resetPasswordController = async (req, res) => {
    try {
        const { token } = req.params;
        console.log("Token from params:", token);
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Kiểm tra token chưa hết hạn $git là lớn hơn 
        })

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // Xóa token và thời gian hết hạn sau khi đặt lại mật khẩu
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// Nhiệm vụ của refresh token là giúp người dùng lấy access token mới khi access token hết hạn mà không cần phải đăng nhập lại
// Refresh token thường có thời gian sống lâu hơn access token
// Refresh token nên được lưu trữ an toàn, không nên lưu trữ trong local storage hoặc session storage vì dễ bị tấn công XSS