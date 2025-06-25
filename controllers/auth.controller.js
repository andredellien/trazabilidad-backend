const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createUser, findByUsuario, findById } = require("../models/auth.model");

const JWT_SECRET = process.env.JWT_SECRET || "super‑secreto";

exports.register = async (req, res) => {
	try {
		const { Nombre, Cargo, Usuario, Password } = req.body;
		if (!Nombre || !Usuario || !Password) {
			return res.status(400).json({ message: "Campos requeridos" });
		}
		const existing = await findByUsuario(Usuario);
		if (existing) return res.status(409).json({ message: "Usuario ya existe" });

		await createUser({ Nombre, Cargo, Usuario, Password });
		res.status(201).json({ message: "Usuario registrado" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error al registrar usuario" });
	}
};

exports.login = async (req, res) => {
	try {
		const { Usuario, Password } = req.body;
		const user = await findByUsuario(Usuario);
		if (!user)
			return res.status(401).json({ message: "Credenciales inválidas" });

		const ok = await bcrypt.compare(Password, user.PasswordHash);
		if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

		const token = jwt.sign(
			{ id: user.IdOperador, nombre: user.Nombre, cargo: user.Cargo },
			JWT_SECRET
		);
		res.json({ token });
	} catch (err) {
		res.status(500).json({ message: "Error al iniciar sesión" });
	}
};

exports.getMe = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await findById(userId);
		
		if (!user) {
			return res.status(404).json({ message: "Usuario no encontrado" });
		}

		// Remove sensitive information
		const { PasswordHash, ...userInfo } = user;
		res.json(userInfo);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error al obtener información del usuario" });
	}
};
