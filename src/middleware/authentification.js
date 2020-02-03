const jwt = require("jsonwebtoken")
const User = require("../models/user.js")

const auth = async(req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "")
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = await User.findOne({ id: decoded._id, "tokens.token": token })
        if (!user) {
            throw new Error("user not found")
        }
        req.token = token
        req.user = user
        console.log(user);

        next()
    } catch (e) {
        res.send(e)
    }
}

module.exports = auth