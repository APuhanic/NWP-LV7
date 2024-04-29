const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    naziv_projekta: String,
    opis_projekta: String,
    cijena_projekta: Number,
    obavljeni_poslovi: String,
    datum_pocetka: Date,
    datum_zavrsetka: Date,
    voditelj_projekta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId, // Tip podatka je ObjectId koji se referencira na User modele
        ref: 'User' // Referencira se na modele koji su definirani kao 'User'
    }]
});

module.exports = mongoose.model('Project', projectSchema);
