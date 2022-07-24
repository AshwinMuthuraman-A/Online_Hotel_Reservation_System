var express = require('express');
const mysql = require('mysql2');
const router = express.Router();
var db_connecton_path = './db_connection';
var connection = require(db_connecton_path);
var bodyParser = require('body-parser');
// const { response } = require('express');
var urlEncoder = bodyParser.urlencoded({ extended: false });
router.use(express.static(__dirname + './../public'));
let response;

router.post('/cust_create', urlEncoder, (req, res) =>  {
    response = req.body;
    var custLoginTbl = 'cust_login';
    let sql = `INSERT INTO ${custLoginTbl} VALUES ('${response.email}','${response.password}', '${response.uname}')`;
    connection.query(sql, function(error, result) {
        if(error) {
            console.log('Error' + error.stack);
        }
        let iresult = [{name:response.uname}];
        req.session.valid = true;
        req.session.userData = iresult;
        res.redirect("http://localhost:3000/");
    });
});

router.post('/custlogin_verify', urlEncoder, (req, res) => {
    //json object
    response = req.body;
    var custLoginTbl = 'cust_login';
    let sql = `SELECT * FROM ${custLoginTbl} WHERE email='${response.email}' AND password='${response.password}'`;
    connection.query(sql, function(error, result, fields) {
        let lobj = {
            loginCorrect:true , 
            initialLogin:true , 
            numTriesExceeded:false
        };
        if(error) {
            console.log('Error' + error.stack);
        }
        if(result.length<=0) {
            req.session.num_of_tries++;
            lobj.initialLogin = false;
            lobj.loginCorrect = false;
            if(req.session.num_of_tries == 4) {
                lobj.numTriesExceeded =true;
                req.session.num_of_tries = 1;
            }
            res.render('login' , lobj);
        }
        else {          
            req.session.valid = true;
            req.session.userData = result;
            res.redirect('http://localhost:3000/' );
        }
    });
});

router.get('/logout', urlEncoder, (req, res) => {
    console.log('session user - deleted');
    delete req.session.num_of_tries;
    delete req.session.valid;
    delete req.session.userData;
    res.redirect('http://localhost:3000/');
});

module.exports = router;