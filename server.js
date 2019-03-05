/**
 * Created at : 26/11/2018 
 * Last modified at : 23/01/2019
 * Author : Kenza BOUSSAOUD, k_boussaoud@yahoo.fr
 * Synopsis: 
 * Dependencies: 
 */
// Chargement des modules
const express = require('express');
cors = require('cors'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken')
cookieParser = require('cookie-parser')
check_module = require('./utils/validation'),
    user_controllers = require('./routes/user.route')

const userModel = require('./models/user.model')
const tokenModel = require('./models/token.model')

const app = express();
const PORT = 8080;

// Autoriser un accès public à l'API
app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization ");
    response.header("Access-Control-Allow-Methods", 'PUT, POST, GET, DELETE');
    response.header('Access-Control-Allow-Credentials', true);
    next();
});

// Connexion à la base de données
mongoose.connect('mongodb://localhost/KenzaB', { useNewUrlParser: true },
    function (err) { console.log((err) ? err : 'MongoDB Connection successful') });

// Utilisation de json pour parser les données
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Affichage de la page index.html
app.get('/', function (req, res) {
    res.status(200);
    window.location.href('index.html')
});

// Route d'inscription d'un utilisateur
app.post('/register', function (req, res) {
    console.log('Registering user...')
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        user_controllers.register(req, res, hash)
    });
});

// Route d'authentification d'un utilisateur
app.post('/login', function (req, res) {
    console.log('Logging in user...')
    user_controllers.login(req, res)
});

// Route de récupération d'un utilisateur /user/{token}
app.get('/user/:token', function (req, res) {
    tokenModel.findOne({ token: req.params.token }, function (err, rslt) {
        if (!rslt) {
            res.status(401).json({
                error: true,
                message: "Le token envoyé n'existe pas",
                token: req.params.token
            })
        }
        else {
            if (rslt.revoquer == true) {
                res.status(401).json({
                    error: true,
                    message: "Le token envoyé n'est plus valide, veuillez le réinitialiser",
                    token: req.params.token
                })
            }
            userModel.findById(rslt.user_id, function (err, user) {
                res.status(200).json({
                    error: false,
                    user: user
                })
            })
        }
    })
})

// Modification des informations propres à l'utilisateur
app.put('/user/:token', function (req, res) {
    console.log('Modifying my information')
    // Create a new user (null object)
    let newUser = Object.create(null);

    if (req.body.lastname !== undefined) {
        newUser.lastname = req.body.lastname;
    }
    if (req.body.firstname !== undefined) {
        newUser.firstname = req.body.firstname;
    }
    if (req.body.date_naissance !== undefined) {
        newUser.date_naissance = req.body.date_naissance;
    }
    if (req.body.sexe !== undefined) {
        newUser.sexe = req.body.sexe;
    }
    if (req.body.updated_at !== undefined) {
        newUser.updated_at = Date.now;
    }
    tokenModel.findOne({ token: req.params.token }, function (err, rslt) {
        let user_id = rslt.user_id;
        userModel.updateOne({ _id: user_id }, newUser, function () {
            res.status(200).json({
                error: false,
                message: "L'utilisateur a été modifié avec succès"
            });
        })
    })
})

// Route de modification du mot de passe de l'utilisateur
app.put('/user/mdp/:token', function (req, res) {
    console.log('Modifying my password')
    user_controllers.change_password(req, res)
})

// Route de récupération des utilisateurs /users/{token}
app.get('/users/:token', function (req, res) {
    tokenModel.findOne({ token: req.params.token }, function (err, rslt) {
        if (!rslt) {
            res.status(401).json({
                error: true,
                message: "Le token envoyé n'existe pas",
                token: req.params.token
            })
        }
        else {
            if (rslt.revoquer == true) {
                res.status(401).json({
                    error: true,
                    message: "Le token envoyé n'est plus valide, veuillez le réinitialiser",
                    token: req.params.token
                })
            }
            userModel.find({}, function (err, users) {
                res.status(200).json({
                    error: false,
                    users: users
                });
            })
        }
    })

})

// Route de déconnexion de l'utilisateur
app.delete('/user/:token', function (req, res) {
    tokenModel.findOne({ token: req.params.token }, function (err, rslt) {
        if (!rslt) {
            res.status(401).json({
                error: true,
                message: "Le token envoyé n'existe pas",
                token: req.params.token
            })
        }
        else {
            tokenModel.deleteOne({ token: req.params.token }, function (err, rslt) {
                res.status(200).json({
                    error: false,
                    message: "L'utilisateur a bien été déconnecté"
                })
            })
        }
    })

})


app.listen(PORT, function () {
    console.log('Server is running on Port', PORT);
});