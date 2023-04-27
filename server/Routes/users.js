const router = require("express").Router()
const bcrypt = require("bcrypt")
const User = require("../Models/User")


// read: GET ONE USER
router.get("/",  async (req, res) => {
    const userId = req.query.userId
    const username = req.query.username
    try{
        const user = userId 
        ? await User.findById(userId)
        : await User.findOne({username : username})
        //destructuring what we want to show
        const {password, updatedAt, ...other} = user._doc
        res.status(200).json(other)
    }catch (err) {
        return res.status(500).json(err)
    }
})


//read: GET USER FRIENDS
router.get("/friends/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        const friends = await Promise.all(
            user.followings.map((friendId) => {
                return User.findById(friendId)
            })
        )

        let friendList = []
        friends.map((friend) => {
            const {_id, username, profilePicture} = friend
            friendList.push({_id, username, profilePicture})

        })
        res.status(200).json(friendList)

    }
    catch(err){
        res.status(500).json(err)
    }
})


// update: UPDATE USER
router.put("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){

        //if password exists the go into this if or go for the normal try present below this
        if(req.body.password){

            try{
                req.body.password = await bcrypt.hash(req.body.password, 10)
            }catch (err) {
                return res.status(500).json(err)
            }
        }

        try{
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set : req.body
            })
            res.status(200).json("Your account has been updated!")
        }catch (err) {
            return res.status(500).json(err)
        }

    }else{
        return res.status(403).json("You can update only your account!")
    }

})


// update: FOLLOW A USER
router.put("/:id/follow", async (req, res) => {
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({
                    $push : {followers : req.body.userId}
                })
                await currentUser.updateOne({
                    $push : {followings : req.params.id}
                })
                res.status(200).json("The user has been followed")

            }else{
                res.status(403).json("Your already follow this user")
            }
        }catch (err){
            return res.status(500).json(err)
        }

    }else{
        res.status(403).json("You cannot follow yourself")
    }
})




// update: UNFOLLOW A USER
router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({
                    $pull : {followers : req.body.userId}
                })
                await currentUser.updateOne({
                    $pull : {followings : req.params.id}
                })
                res.status(200).json("The user has been unfollowed")

            }else{
                res.status(403).json("Your dont follow this user/so you cannot unfollow him")
            }
        }catch (err){
            return res.status(500).json(err)
        }

    }else{
        res.status(403).json("You cannot unfollow yourself")
    }
})



// delete: DELETE USER
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){
        try{
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Your account has been deleted!")
        }catch (err) {
            return res.status(500).json(err)
        }

    }else{
        return res.status(403).json("You can delete only your account!")
    }  
})


module.exports = router