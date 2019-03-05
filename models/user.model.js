/**
 * Created at : 26/11/2018 
 * Last modified at : 29/11/2018
 * Author : Kenza BOUSSAOUD, k_boussaoud@yahoo.fr
 * Synopsis: User model
 * Dependencies: mongoose
 */

// Chargement de mongoose
const mongoose = require('mongoose')
// Création d'un type 'sexe'
const sexes = { F: 'Féminin', M: 'Masculin' }

// Création du modèle Utilisateur
const userSchema = mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    date_naissance: { type: Date, required: true },
    sexe: { type: sexes, default: sexes.F, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

// Export du modèle utilisateur
module.exports = mongoose.model('users', userSchema);