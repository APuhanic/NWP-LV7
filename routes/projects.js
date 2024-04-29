const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const User = require('../models/User');

// Dodaj novi projekt
const jwt = require('jsonwebtoken');

router.post('/project', async (req, res) => {
    try {
        // Provjeri je li JWT token prisutan u kolačićima
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Nedostaje JWT token u kolačićima.' });
        }

        // Dekodiraj JWT token kako bismo dobili ID trenutnog korisnika
        const decodedToken = jwt.verify(token, 'tajni-ključ');
        const userId = decodedToken.userId;

        // Kreiraj novi projekt s voditeljem projekta postavljenim na trenutnog korisnika
        const project = await Project.create({
            naziv_projekta: req.body.naziv_projekta,
            opis_projekta: req.body.opis_projekta,
            cijena_projekta: req.body.cijena_projekta,
            datum_pocetka: req.body.datum_pocetka,
            datum_zavrsetka: req.body.datum_zavrsetka,
            arhiviairan: false,
            voditelj_projekta: userId // Postavi voditelja projekta na ID trenutnog korisnika
        });

        // Preusmjeri na /projects nakon uspješnog dodavanja projekta
        res.redirect('/projects');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;


// Dohvati sve projekte
router.get('/project', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Prikaži sve projekte filtrirane prema prijavljenom korisniku
router.get('/projects', async (req, res) => {
    try {
        // Provjeri je li JWT token prisutan u kolačićima
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Nedostaje JWT token u kolačićima.' });
        }

        // Dekodiraj JWT token kako bismo dobili ID trenutnog korisnika
        const decodedToken = jwt.verify(token, 'tajni-ključ');
        const userId = decodedToken.userId;

        // Dohvati sve projekte
        const projects = await Project.find({
            $or: [
                { voditelj_projekta: userId }, // Filtriraj projekte gdje je trenutni korisnik voditelj
                { members: userId } // Filtriraj projekte gdje je trenutni korisnik član tima
            ]
        }).populate('members').populate('voditelj_projekta', 'email');

        res.render('projects', { projects });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/project/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('members');

        if (!project) {
            return res.status(404).json({ message: 'Projekt nije pronađen' });
        }
        
        // Dohvati voditelja projekta iz baze podataka koristeći ID
        const projectLeader = await User.findById(project.voditelj_projekta);

        // Formatiranje vrijednosti datuma prije renderiranja predloška
        const formattedProject = {
            ...project._doc,
            datum_pocetka: project.datum_pocetka.toISOString().split('T')[0],
            datum_zavrsetka: project.datum_zavrsetka.toISOString().split('T')[0],
            projectLeaderEmail: projectLeader.email // Dodavanje emaila voditelja projekta u objekt koji se proslijeđuje predlošku
        };

        // Dohvaćanje registriranih korisnika iz baze podataka
        const registeredUsers = await User.find();

        res.render('edit_project', { project: formattedProject, registeredUsers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Uredi postojeći projekt
router.post('/project/edit/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) {
            return res.status(404).json({ message: 'Projekt nije pronađen' });
        }
        res.redirect('/projects');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Obriši postojeći projekt
router.get('/project/delete/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Projekt nije pronađen' });
        }
        res.redirect('/projects');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Dodaj novog člana tima u projekt
router.post('/project/team-members/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        const { email } = req.body;

        // Pronađi korisnika prema email adresi
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Korisnik nije pronađen ili nije registriran.' });
        }

        // Pronađi projekt prema ID-u
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Projekt nije pronađen.' });
        }

        // Dodaj novog člana tima ako već nije dodan
        const existingMember = project.members.find(member => member.equals(user._id));
        if (!existingMember) {
            project.members.push(user._id); // Dodaj ObjectId korisnika
            await project.save();
        }

        res.redirect(`/project/${projectId}`);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Arhiviranje projekta
router.post('/project/archive/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, { arhiviairan: true }, { new: true });
        if (!project) {
            return res.status(404).json({ message: 'Projekt nije pronađen' });
        }
        res.redirect('/projects');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Dohvati sve arhivirane projekte
router.get('/projects/archived', async (req, res) => {
    try {
        const projects = await Project.find({ arhiviairan: true });
        res.render('archive', { projects });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
