const mongoose = require('mongoose')


const exampleSchema = new mongoose.Schema({
    naziv_projekta: String,
    opis_projekta: String,
    cijena_projekta: Number,
    obavljeni_poslovi: String,
    datum_pocetka: Date,
    datum_zavrsetka: Date,
    members: [{
        name: String
    }]
});

module.exports = mongoose.model('Project', exampleSchema);