/**
 * Created at : 26/11/2018 
 * Last modified at : 19/01/2019
 * Author : Kenza BOUSSAOUD, k_boussaoud@yahoo.fr
 * Synopsis: some necessary functions for data validation
 * Dependencies: none
 */

// check first name and last name , string, 5 25
exports.check_name = function check_name(name) {
    return (typeof name == 'string' && name.length <= 25 && name.length >= 5) ? (true) : (false)
}
// check email,,string 10 150
exports.check_email = function check_email(email) {
    return (typeof email == 'string' && email.length <= 150 && email.length >= 10 && email.includes('@')) ? (true) : (false)
}
// check password, string, 7 20, MAJ min chiffre caract§re spécial
exports.check_password = function check_password(password) {
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    return (typeof password == 'string' && strongRegex.test(password)) ? (true) : (false)
}

