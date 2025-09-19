const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const UserDTO = require('../dto/user');
const RefreshToken = require('../models/token');
const JWTService = require('../services/JWTService');
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,32}$/;
const mongoose = require('mongoose');


const authController = {

    //1.validate user input
    async register(req, res, next) {
        const userRegistrationSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });

        const { error } = userRegistrationSchema.validate(req.body);




        //2.if there is error in validaion -> send error through middleware 
        if (error) {
            return next(error);
        }


        //3.if email or username already exist -> return an error
        const { username, name, email, password } = req.body;
        //check if the email and username already exists
        try {
            const usernameInUse = await User.exists({ username });
            const emailInUse = await User.exists({ email });

            if (usernameInUse) {
                const error = {
                    status: 409,
                    message: 'username not available,use different username!'
                }
                return next(error);
            }

            if (emailInUse) {
                const error = {
                    status: 409,
                    message: 'email already registered,use different email!'
                }
                return next(error);
            }
        } catch (error) {
            return next(error);
        }



        //4.hash the password
        const hashedPassword = await bcrypt.hash(password, 10);


        //5.store user data into the datbase
        let accessToken;
        let refreshToken;
        let user;
        try {
            const userToRegister = new User({
                username,
                email,
                name,
                password: hashedPassword
            })
            user = await userToRegister.save();
            //token generation 
            accessToken = JWTService.signAccessToken({ _id: user.id }, '30m');
            refreshToken = JWTService.signRefreshToken({ _id: user.id }, '60m');

        } catch (error) {
            return next(error);
        };

        //store refreshToken in the database
        await JWTService.storeRefreshToken(refreshToken, user._id);

        //send to the client-side using cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 30,
            httpOnly: true
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60,
            httpOnly: true
        });

        //6.update the response
        const userDto = new UserDTO(user);
        return res.status(201).json({ user: userDto, auth: true });
    },


    async login(req, res, next) {
        //1. validate user input
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern).required()
        });

        const { error } = userLoginSchema.validate(req.body);

        //2.if validation error->retrun error
        if (error) {
            const err = {
                status: 401,
                message: 'Invalid UserName or Password'
            }
            return next(err);
        }

        //3.match username and password
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        try {
            //match username

            if (!user) {
                const error = {
                    status: 401,
                    message: 'Invalid UserName or Password'
                }
                return next(error);

            }

            //match password
            //req.body.password ->hash -> match
            const match = await bcrypt.compare(password, user.password)

            if (!match) {
                const error = {
                    status: 401,
                    message: 'Invalid UserName or Password'
                }
                return next(error);

            }
        } catch (error) {
            return next(error);
        }

        //4.return response
        //create tokens
        const accessToken = JWTService.signAccessToken({ _id: user.id }, '30m');
        const refreshToken = JWTService.signRefreshToken({ _id: user.id }, '60m');

        //update refresh token in the database
        try {
            await RefreshToken.updateOne({
                _id: user._id,
            },
                { token: refreshToken },
                { upsert: true });
        } catch (error) {
            return next(error);
        }

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 30,
            httpOnly: true
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60,
            httpOnly: true
        });
        const userDto = new UserDTO(user)
        return res.status(200).json({ user: userDto, auth: true });

    },

    async logout(req, res, next) {
        //delete refresh token
        const { refreshToken } = req.cookies;
        let user;
        try {
            await RefreshToken.deleteOne({ token: refreshToken });
        } catch (error) {
            return next(error);
        }

        //clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        //send response
        res.status(200).json({ user: null, auth: false })
    },

    async refresh(req, res, next) {

        //get refresh token from cookies
        const orignalRefreshToken = req.cookies.refreshToken;

        //verify the refresh token 
        let id;
        try {
            id = JWTService.verifyRefreshToken(orignalRefreshToken)._id
        } catch (e) {
            const error = {
                status: 401,
                message: 'Unauthorised'
            }
            return next(error);
        }

        //generate new token 
        try {
            const match = RefreshToken.findOne({ _id: id });

            if (!match) {
                const error = {
                    status: 401,
                    message: 'Unauthorised'
                }
                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        try {
            accessToken = JWTService.signAccessToken({ _id: id }, '30m');
            refreshToken = JWTService.signRefreshToken({ _id: id }, '60m');

            //update db 
            await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 30,
                httpOnly: true
            });
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60,
                httpOnly: true
            });
        } catch (error) {
            return next(error);
        }

        //response
        const user = await User.findOne({ _id: id })
        const userDto = new UserDTO(user);
        return res.status(200).json({ user: userDto, auth: true });

    },
    async deleteUser(req, res, next) {
        try {
            let { refreshToken } = req.cookies;

            // Find the refresh token document
            const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
            if (!tokenDoc) {
                return res.status(404).json({ message: "Refresh token not found" });
            }

            // Ensure userId is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(tokenDoc._id)) {
                return res.status(400).json({ message: "Invalid User ID format" });
            }

            const userId = tokenDoc._id;

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Delete user from the database
            await User.deleteOne({ _id: userId });

            // Remove associated refresh token(s)
            await RefreshToken.deleteOne({ _id: userId });
            await RefreshToken.deleteOne({ userId: userId });


            // Clear cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            return res.status(200).json({ message: "User deleted successfully" });

        } catch (error) {
            return next(error);
        }
    },

    async makeAdmin(req, res, next) {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.role = 'admin';
            await user.save();

            return res.status(200).json({ message: `${email} promoted to admin.` });
        } catch (error) {
            return next(error);
        }
    }

}
module.exports = authController;