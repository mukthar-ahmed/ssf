const JWTService = require('../services/JWTService')
const User = require('../models/user');
const UserDTO = require('../dto/user');
const auth = async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    try {
        if (!accessToken || !refreshToken) {
            const error = {
                status: 401,
                message: 'unauthorised'
            }
            return next(error)
        }

        let _id;
        try {
            _id = JWTService.verifyAccessToken(accessToken)._id;  //JWTService.verifyAccessToken(accessToken)rerturns the playload

        } catch (error) {
            return next(error);
        }

        let user;
        try {
            user = await User.findOne({ _id: _id });
        } catch (error) {
            return next(error);
        }

        const userDto = new UserDTO(user);
        req.user = userDto;

        next();
    } catch (error) {
        return next(error);
    }

}

module.exports = auth;