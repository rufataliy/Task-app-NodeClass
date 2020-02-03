const express = require("express")
const router = new express.Router()
const user = require("../models/user.js")
const auth = require("../middleware/authentification.js")
const multer = require("multer")
const sharp = require("sharp")
const { sendWelcome, sendCancel } = require("../emails/account.js")
const avatar = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        const reg = new RegExp(/\.(jpeg|png|jpg)$/)
        if (!file.originalname.match(reg)) {
            return cb(new Error("please provide a image"))
        }
        cb(undefined, "image uploaded")
    }
})

router.post("/users/me/avatar", auth, avatar.single("avatar"), async(req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send("avatar created")
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})
router.delete("/users/me/avatar", auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send("avatar deleted")
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get("/users", auth, async(req, res) => {
    try {
        const users = await user.find({})
        res.send(users)
    } catch (e) {
        res.status(400).send(e)
    }

})
router.post("/users", async(req, res) => {
    const newUser = new user(req.body)
    try {
        await newUser.save()
        sendWelcome(newUser.email, newUser.name)
        const token = await newUser.generateAuthToken()
        res.status(201).send({ newUser, token })
    } catch (e) {
        res.status(400).send(e)
    }
})
router.post("/users/me", auth, async(req, res) => {
    const newUser = new user(req.body)
    try {
        await newUser.save()
        const token = await newUser.generateAuthToken()
        res.status(201).send({ newUser, token })
    } catch (e) {
        res.status(400).send(e)
    }
})
router.get("/users/:id", async(req, res) => {
    const id = req.params.id
    try {
        const userFound = await user.findById(id)
        if (!userFound) {
            return res.status(400).send("user not found")
        }
        res.send(userFound)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.get("/users/:id/avatar", async(req, res) => {
    const id = req.params.id
    try {
        const userFound = await user.findById(id)
        if (!userFound || !userFound.avatar) {
            return res.status(400).send("user not found")
        }
        res.set("Content-Type", "image/png")
        res.send(userFound.avatar)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.delete("/users/me", auth, async(req, res) => {
    try {
        const userDeleted = await user.findOneAndDelete({ _id: req.user._id })
        if (!userDeleted) {
            return res.status(400).send("user not found")
        }
        sendCancel(userDeleted.email, userDeleted.name)
        res.send(userDeleted)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.patch("/users/me", auth, async(req, res) => {
    const allowed = ["name", "email", "age"]
    const updates = req.body
    const updateFields = Object.keys(updates)
    const isValidOperation = updateFields.every(update => {
        return allowed.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send("Bad fields")
    }
    try {
        updateFields.forEach(update => req.user[update] = updates[update])
        await req.user.save()
            // const userFound = await user.findByIdAndUpdate(id, updates, { new: true, runValidator: true })
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.post("/users/login", async(req, res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        const userFound = await user.findByCredentials(email, password)
        const token = await userFound.generateAuthToken()
        res.send({ user: userFound, token })
    } catch (e) {
        res.status(400).send(e)
    }
})
router.post("/users/logout", auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send("logged out")
    } catch (e) {
        res.status(500).send(e)
    }
})
router.post("/users/logoutAll", auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send("logged out all")
    } catch (e) {
        res.status(500).send(e)
    }
})
module.exports = router