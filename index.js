const express = require("express")
require("./src/db/mongoose.js")

const userRouter = require("./src/routers/user")
const taskRouter = require("./src/routers/task")


const multer = require("multer")
const upload = multer({
    dest: "images",
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        const reg = new RegExp(/\.(doc|docx)$/)
        if (!file.originalname.match(reg)) {
            cb(new Error("please provide word file"))
        }
        cb(undefined, "file uploaded")
    }
})

const app = express()
app.post("/upload", upload.single("upload"), (req, res) => {
    res.send()
})

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(process.env.PORT, console.log("app is running on " + process.env.PORT))