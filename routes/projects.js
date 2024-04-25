const express = require('express');
const router = express.Router();
const Project = require('../models/project');

// Dodaj novi projekt
router.post('/project', async (req, res) => {
    try {
        const project = await Project.create(req.body);
        // Redirekcija na /projects nakon uspješnog dodavanja projekta
        res.redirect('/projects');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// Dohvati sve projekte
router.get('/project', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Prikaži sve projekte
router.get('/projects', async (req, res) => {
    try {
        res.render('projects', { projects: await Project.find() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Prikazi detalje o određenom projektu
router.get('/project/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Projekt nije pronađen' });
        }
        
        // Format the date values before rendering the template
        const formattedProject = {
            ...project._doc,
            datum_pocetka: project.datum_pocetka.toISOString().split('T')[0],
            datum_zavrsetka: project.datum_zavrsetka.toISOString().split('T')[0]
        };

        console.log(formattedProject);

        res.render('edit_project', { project: formattedProject });
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
        const { name } = req.body;

        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Projekt nije pronađen' });
        }

        // Add the new team member
        project.members.push({ name });
        await project.save();

        res.redirect(`/project/${projectId}`);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
