const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();


router.get('/', function(req, res, next) {
    // Provjeri je li JWT token prisutan u kolačićima
    const token = req.cookies.jwt;

    if (token) {
        // Provjeri valjanost JWT tokena
        jwt.verify(token, 'tajni-ključ', function(err, decoded) {
            if (err) {
                // Ako token nije valjan, preusmjeri korisnika na /login
                res.redirect('/login');
            } else {
                // Ako je token valjan, preusmjeri korisnika na /projects
                res.redirect('/projects');
            }
        });
    } else {
        // Ako token nije prisutan, preusmjeri korisnika na /login
        res.redirect('/login');
    }
});

module.exports = router;

