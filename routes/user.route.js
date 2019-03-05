/**
 * Created at : 26/11/2018 
 * Last modified at : 23/01/2019
 * Author : Kenza BOUSSAOUD, k_boussaoud@yahoo.fr
 * Synopsis: User routes
 * Dependencies: see requires
 */
const userModel = require('../models/user.model');
const tokenModel = require('../models/token.model');
const config = require('../config/config');
const validation_module = require('../utils/validation')


// Enregistrement d'un utilisateur
exports.register = function register(req, res, hash) {
    // On vérifie si l'utilisateur a bien rentré un email et un mot de passe
    if (req.body.email === '' || req.body.password === '') {
        res.status(401).json({
            error: true,
            message: "Une ou plusieurs données obligatoire est manquante."
        })
    }
    // On créé une instance d'un USER 
    else {
        const user = new userModel({
            _id: new mongoose.Types.ObjectId(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hash,
            sexe: req.body.sexe,
            date_naissance: req.body.date_naissance,

        });
        // On vérifie que cet utilisateur n'existe pas dans la base de données
        userModel.find({ email: req.body.email }, (err, users) => {
            if (users.length != 0) {
                res.status(401).json({
                    error: true,
                    message: "Votre email n'est pas correct (il existe déjà dans la base de données)"
                })
            }
            else {
                // create a token
                const user_token = jwt.sign({ user },
                    config.secret,
                    { expiresIn: 86400 } // expires in 24 hours  
                );
                // s'il n'existe pas, on vérifie la conformité des données
                (validation_module.check_email(req.body.email) && validation_module.check_name(req.body.firstname)
                    && validation_module.check_name(req.body.lastname) && validation_module.check_password(req.body.password)) ?
                    // on enregistre l'utilisateur dans la base
                    (user.save().then(() => {
                        let myTokenData = new tokenModel({
                            user_id: user._id,
                            token: user_token,
                            refresh_token: 86400
                        });
                        myTokenData.save()
                            .then(() => {
                                // on envoit la réponse en json
                                res.status(201).json({
                                    error: false,
                                    message: "L'utilisateur a été créé avec succès",
                                    tokens: {
                                        token: user_token,
                                        refresh_token: 86400,
                                        createdAt: Date.now
                                    }
                                });
                            })
                    })
                    ) : (res.status(401).json({
                        error: true,
                        message: "Une ou plusieurs données n'est pas conforme",
                    }));
            }
        })
    }
}

// Connexion 
exports.login = function login(req, res) {
    // On vérifie que l'utilisateur est bien enregistré dans notre base de données
    userModel.findOne({ email: req.body.email }, function (err, user) {
        // Cas utilisateur non existant
        if (!user) {
            return res.status(401).json({
                error: true,
                message: "L'email entré est inconnu",
            })
        }
        // Si l'utilisateur existe
        if (user) {
            // On compare les mots de passe
            bcrypt.compare(req.body.password, user.password, function (err, result) {
                if (!result) {
                    return res.status(401).json({
                        error: true,
                        message: "Votre mot de passe est erroné"
                    });
                }
                // Si le mot de passe est OK, on vérifie si  l'utilisateur  a bien un token
                // Si le token existe
                if (result) {
                    tokenModel.findOne({ user_id: user._id }, function (err, rslt) {
                        if (rslt) {
                            // si le revoquer est faux, on autorise l'utilisateur à se connecter. 
                            if (rslt.revoquer == false) {
                                res.status(200).json({
                                    error: false,
                                    message: "L'utilisateur a été authentifié avec succès",
                                    tokens: {
                                        token: rslt.token,
                                        refresh_token: rslt.refresh_token,
                                        createdAt: rslt.createdAt
                                    }
                                })
                            }
                        }
                        else {
                            // Si revoquer = true ou que le token n'existe pas (supprimé après une déconnecion)
                            // on génère un nouveau token
                            let user_token = jwt.sign({ user },
                                config.secret,
                                { expiresIn: 86400 } // expires in 24 hours  
                            );
                            let myTokenData = new tokenModel({
                                user_id: user._id,
                                token: user_token,
                                refresh_token: 86400
                            });
                            myTokenData.save().then(() => {
                                res.status(200).json({
                                    error: false,
                                    message: "L'utilisateur a été authentifié avec succès",
                                    tokens: {
                                        token: user_token,
                                        refresh_token: 86400,
                                        createdAt: Date.now
                                    }
                                })
                            })
                        }
                    });
                }
            })
        };
    })
}

// Modification du mot de passe
exports.change_password = function change_password(req, res) {
    tokenModel.findOne({ token: req.body.token }, function (err, token_rslt) {
        userModel.findById(token_rslt.user_id, function (err, rslt) {
            // On vérifie que l'utilisateur a bien rentré le bon mot de passe
            bcrypt.compare(req.body.oldPassword, rslt.password, function (err, result) {
                if (!result) {
                    return res.status(401).json({
                        error: true,
                        message: "Votre mot de passe est erroné"
                    });
                }
                if (result) {
                    if (validation_module.check_password(req.body.newPassword) && req.body.newPassword == req.body.confirmPassword) {
                        let newUser = Object.create(null);
                        newUser.password = req.body.newPassword;
                        userModel.updateOne({ _id: token_rslt.user_id }, newUser, function (resultatt) {
                            res.status(200).json({
                                error: false,
                                message: "Le mot de passe a été modifié avec succès"
                            });
                        })
                    }
                }
            })
        })
    })
}