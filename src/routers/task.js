const express = require("express")
const router = new express.Router()
const Task = require("../models/task.js")
const auth = require("../middleware/authentification.js")

router.get("/tasks/:id", auth, async(req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id: _id, owner: req.user._id })
        if (!task) {
            return res.status(400).send("user not found")
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})


router.delete("/tasks/:id", auth, async(req, res) => {
    const _id = req.params.id
    try {
        const taskDeleted = await Task.findOneAndDelete({
            _id,
            owner: req.user._id
        })
        if (!taskDeleted) {
            return res.status(400).send("task not found")
        }
        res.send(taskDeleted)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.post("/tasks", auth, async(req, res) => {
    const newTask = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await newTask.save()
        res.status(200).send(newTask)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/tasks", auth, async(req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === "true"
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        console.log(parts);

        sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }
    console.log(sort);

    try {
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                sort,
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(400).send(e)
    }

})

module.exports = router