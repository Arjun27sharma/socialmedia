const User = require("../Models/User")
const router = require("express").Router()
const bcrypt = require("bcrypt")


// create: REGISTER USER
router.post("/register", async (req, res) => {

    try {
        //generating new password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        //creating a new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })

        //save uer and respond
        const user = await newUser.save()
        res.status(200).json(user)
    }
    catch (err) {
        console.log("Error when registering the user : " + err)
        res.status(500).json(err)

    }

})



// create: LOGIN USER
router.post("/login", async (req, res) => {
    try {
        //checking if user is there or not
        const user = await User.findOne({ email: req.body.email })
        !user && res.status(404).json("User Not found")

        //validating the password
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).json("Wrong password")

        //returning the user if the user exists and the passwords are matched
        res.status(200).json(user)
    }
    catch (err) {
        console.log("The user Login error : " + err)
        res.status(500).json(err)
    }
})

module.exports = router