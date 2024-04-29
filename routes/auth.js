// Uvoz potrebnih modula
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Uvezite model korisnika

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Ruta za registraciju korisnika
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Provjera postoji li korisnik s istom email adresom
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Korisnik s tom email adresom već postoji.' });
        }

        // Hashiranje lozinke
        const hashedPassword = await bcrypt.hash(password, 10);

        // Stvaranje novog korisnika
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Registracija uspješna.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta za prijavu korisnika
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Pronalaženje korisnika po email adresi
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Neispravna email adresa ili lozinka.' });
        }

        // Provjera lozinke
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Neispravna email adresa ili lozinka.' });
        }

        // Generiranje JWT tokena
        const token = jwt.sign({ userId: user._id }, 'tajni-ključ', { expiresIn: '1h' });
        res.cookie('jwt', token, { httpOnly: true }); // Postavljanje JWT tokena kao kolačića

        res.redirect('/projects');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta za odjavu korisnika
router.post('/logout', (req, res) => {
    // Clear the JWT token cookie
    res.clearCookie('jwt');

    // Redirect the user to the home page or any other desired page after logout
    res.redirect('/');
});



module.exports = router;
