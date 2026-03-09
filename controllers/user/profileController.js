const User = require('../../models/user/userModel')
const Address = require('../../models/user/addressModel')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')


const loadProfile = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId).lean();
        const address = await Address.findOne({ user: userId, isDefault: true });
        const success = req.query.success === 'true' ? 'Profile updated successfully!' : null;
        const pwSuccess = req.query.pwSuccess === 'true';
        return res.render('user/userProfile', { user, address: address || null, success, errors: null, pwSuccess })

    } catch (error) {
        res.status(500).json({ error: 'page not loading' })
    }
}


const updateProfile = async (req, res) => {

    try {
        console.log("SESSION:", req.session.user);
        console.log("BODY:", req.body);
        const findUser = await User.findById(req.session.user._id).lean();

        if (!findUser) {
            return res.render('user/userProfile', { error: "User not found", user: findUser });
        }

        const { fullName, email, phoneNumber } = req.body;
        const errors = {};

        const nameRegex = /^[A-Za-z\s]{3,}$/;
        if (!fullName) {
            errors.fullName = "Full name is required";
        } else if (!nameRegex.test(fullName)) {
            errors.fullName = "Enter a valid full name (only letters, min 3 chars)";
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneNumber) {
            errors.phoneNumber = "Phone number is required";
        } else if (!phoneRegex.test(phoneNumber)) {
            errors.phoneNumber = "Enter a valid 10-digit phone number";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            errors.email = "Enter a valid email address";
        } else {
            const existingUser = await User.findOne({ email });
            if (existingUser && email != req.session.user.email) {
                errors.email = "Email already registered";
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.render('user/userProfile', {
                errors,
                user: findUser,
                success: null
            });
        }

        const updateData = { fullName, phoneNumber };
        if (req.file) {
            updateData.profilePhoto = '/uploads/profiles/' + req.file.filename;
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.session.user._id,
            updateData,
            { new: true }
        ).lean();

        req.session.user = {
            _id: updatedUser._id,
            fullName: updatedUser.fullName,   // ← key fix
            email: updatedUser.email,
            isBlocked: updatedUser.isBlocked

        };

        res.redirect('/profile');

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "cannot update" });
    }
}


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const errors = {};

        const userId = new mongoose.Types.ObjectId(req.session.user._id);
        const findUser = await User.findById(userId);
        if (!findUser) return res.redirect('/profile');

        const passwordMatch = await bcrypt.compare(currentPassword, findUser.password);

        if (!currentPassword) {
            errors.currentPassword = 'Current password is required';
        } else if (!passwordMatch) {
            errors.currentPassword = 'Invalid current password';
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/;
        if (!newPassword) {
            errors.newPassword = 'Password is required';
        } else if (!passwordRegex.test(newPassword)) {
            errors.newPassword = 'Min 8 chars with uppercase, lowercase, number & special character';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            const address = await Address.findOne({ user: findUser._id, isDefault: true });
            return res.render('user/userProfile', {
                errors, user: findUser, success: null, address: address || null
            });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        const result = await User.findByIdAndUpdate(
            findUser._id,
            { $set: { password: passwordHash } },
            { new: true }
        );
        console.log('Password updated for:', result?.email);

        res.redirect('/profile?pwSuccess=true');

    } catch (error) {
        console.log('ERROR:', error);
        res.redirect('/profile');
    }
};



module.exports = {
    loadProfile,
    updateProfile,
    changePassword
}