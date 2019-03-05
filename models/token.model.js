/**
 * Created at : 26/11/2018 
 * Last modified at : 29/11/2018
 * Author : Kenza BOUSSAOUD, k_boussaoud@yahoo.fr
 * Synopsis: Token model
 * Dependencies: mongoose
 */

// Chargement de mongoose
const mongoose = require('mongoose')

// Création du modèle Token
const tokenSchema = mongoose.Schema({
    user_id : {type: String, required: true},
    token: {type:String, required: true, default: false},
    refresh_token: {type: Date, required: true},
    revoquer: { type: Boolean, default: false, required: true},
    createdAt: { type: Date, default: Date.now, required:true },
})

// Export du modèle utilisateur
module.exports = mongoose.model('tokens', tokenSchema);