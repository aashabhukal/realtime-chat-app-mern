import express from "express";
import {
  getUsers,
  getUserById,
  updateProfile,
  uploadAvatar,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", protect, getUsers);

// --- FRIENDS ROUTES - FIXED ---
router.get("/friends/list", protect, getFriends); // <-- YE MISSING THA, AB ADD KIYA
router.get("/friends/requests", protect, getFriends); // pending requests bhi same se ayegi
router.post("/friends/request/:userId", protect, sendFriendRequest);
router.post("/friends/accept/:userId", protect, acceptFriendRequest);
router.post("/friends/reject/:userId", protect, rejectFriendRequest);
router.delete("/friends/:userId", protect, removeFriend);

// --- STATUS & CALL KE LIYE JAGAH ---
// Baad me yaha status/call routes add kar denge

router.get("/profile", protect, getUserById);
router.put("/profile", protect, updateProfile);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

// YE HAMESHA LAST ME RAHEGA
router.get("/:id", protect, getUserById);

export default router;