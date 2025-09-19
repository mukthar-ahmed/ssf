class UserDTO {
    constructor(user) {
        this._id = user._id;
        this.name = user.name;
        this.username = user.username;
        this.email = user.email;
        this.profilePic = user.profilePic;
        this.phone = user.phone;
        this.role = user.role;
    }
}

module.exports = UserDTO;