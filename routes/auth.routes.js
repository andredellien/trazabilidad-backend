const { Router } = require("express");
const router = Router();
const authCtrl = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/verifyToken");

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.get("/me", verifyToken, authCtrl.getMe);

module.exports = router;
