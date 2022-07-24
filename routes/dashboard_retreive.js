var express = require('express');
const mysql = require('mysql2');
const router = express.Router();
var connection = require('./db_connection');
router.use(express.static(__dirname + '../public'));
var bodyParser = require('body-parser');
const { urlencoded } = require('express');
var urlEncoder = bodyParser.urlencoded({ extended: false });
router.get('/dash_details', urlEncoder, (req, res) => {
    let dataVar = req.session.userData;
    let sql = `SELECT A.ticketID, B.HName, count(A.room_num) AS roomcount, A.checkinDate,A.checkoutDate FROM ticket A, hotel_table B 
               WHERE ticketID in (select ticketID from cust_tkt where cus_email like '${dataVar[0].email}') AND
               A.hotelID = B.Hotel_ID group by ticketID;`
    connection.query(sql, function(error, result, fields) {
        if(error) {
            console.log('Error' + error.stack);
        }
        res.render('dashboard', {user_details: result, dataVar});
    });
});
module.exports = router;