const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "super‑secreto";

module.exports = function (req, res, next) {
	const header = req.headers.authorization;
	if (!header?.startsWith("Bearer ")) return res.sendStatus(401);
	const token = header.split(" ")[1];
	try {
		req.user = jwt.verify(token, JWT_SECRET);
		next();
	} catch {
		res.sendStatus(401);
	}
};
