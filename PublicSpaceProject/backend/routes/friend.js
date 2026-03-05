const express = require("express");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ADD FRIEND
router.post("/add/:id", authMiddleware, async (req, res) => {
  try {

    const userId = req.userId;
    const friendId = req.params.id;

    if (userId === friendId) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.friends.includes(friendId)) {
      return res.json({ message: "Already friends" });
    }

    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.json({
      message: "Friend added successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;