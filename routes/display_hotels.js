var express = require('express');
const mysql = require('mysql2');
const router = express.Router();
var connection = require('./db_connection');
router.use(express.static(__dirname + './../public'));
var bodyParser = require('body-parser');
const { urlencoded } = require('express');
var urlEncoder = bodyParser.urlencoded({ extended: false });

/*router.get('/', function(req, res, next) {
  res.render("home");
});*/

router.post('/hotels', urlEncoder, (req, res) =>  {
    let response = req.body;
    let isloggedIn = req.session.valid;
    let userData = req.session.userData;
    chDate = {
        in: response.checkin,
        out: response.checkout
    };
    req.session.checkDate = chDate;
    let srch = `${response.search_value}`;
    let sql = `SELECT * FROM hotel_table WHERE HName LIKE '%${srch}%' OR address LIKE '%${srch}%' 
               OR Hdesc LIKE '%${srch}%'`;
    connection.query(sql, function(error, result, fields) {
        if(error) {
            console.log('Error' + error.stack);
        }
        let imgquery = `SELECT * FROM hotel_img WHERE Hotel_ID in (select Hotel_ID from hotel_table where HName like '%${srch}%' or address like '%${srch}%')`;
     
        connection.query(imgquery , function(error , imgresult , fields) {
            if(error)
                console.log('Error' + error.stack);
                else {
                    console.log(imgresult);
        res.render('nsearch', {hotelsData: result, imageData:imgresult , isloggedIn, userData, chDate , srch});
                    
                }
        })
    });
});    

router.post('/hdetails' ,urlEncoder, (req , res) => {
    let response = req.body;
    let isloggedIn = req.session.valid;
    let userData = req.session.userData;
    let chDate = req.session.checkDate;
    let hotelImagePath = response.imgPath;
    let hotelName = response.hotelName;
    let hotelAddress = response.hotelAddress;
    let tnum = response.hID.trim();
    let table = `room_${tnum}`;
    console.log(table);
    let sql = `SELECT * FROM ${table} group by Room_type`;
    connection.query(sql , function(error , result , fields)  {
        if (error) {
            console.log('Error' + error.stack);
        }
        console.log('grouped !');
    console.log(hotelImagePath);
    console.log(hotelAddress);
    console.log(hotelName);
        res.render('hdetails' , {final_result: result , hotelDataID :response.hID, isloggedIn, userData, chDate , hotelImagePath,hotelAddress,hotelName});
    });
});

router.post('/roomavail', urlEncoder, (req, res) => {
    let response = req.body;
    let isloggedIn = req.session.valid;
    let userData = req.session.userData;
    let chDate = req.session.checkDate;
    let tnum = response.hID.trim();
    let hotelName = response.hotelName;
    let roomType = response.room_type;
    console.log(tnum);
    let table = `room_${tnum}`;
    let roomTypechk = response.room_type;
    let query1 = `SELECT room_num, cost FROM ${table} A WHERE A.Room_type='${roomTypechk}' AND A.room_num NOT IN
                  (SELECT B.room_num FROM ticket B WHERE hotelID = ${response.hID} AND 
                    ((checkinDate <= '${chDate.in}' AND checkoutDate <= '${chDate.out}' AND checkoutDate >= '${chDate.in}') OR
                    (checkinDate <= '${chDate.in}' AND checkoutDate >= '${chDate.out}') OR
                    (checkinDate >= '${chDate.in}' AND checkinDate <= '${chDate.out}' AND checkoutDate >= '${chDate.out}')))`;
    connection.query(query1, function(err1, res1, f1) {
        if(err1) {
           console.log('Error');
        }
        console.log(res1.length);
        res.render('hdetailsnew' , {final_result: res1 , hotelDataID: req.body.hID, isloggedIn, userData, chDate , hotelName , roomType});
        //res.send('hello' + res1);
    });
});

router.post('/bookroom', urlEncoder, (req, res) => {
    let response = req.body;
    let isloggedIn = req.session.valid;
    let userData = req.session.userData;
    let chDate = req.session.checkDate;
    let amt = response.numofRooms * response.roomCost;
    let sql = `INSERT INTO cust_tkt (cus_email, amount) VALUES('${userData[0].email}', 
               ${amt} * DATEDIFF('${chDate.out}', '${chDate.in}'))`;
    connection.query(sql, function(err, res, f) {
        if(err) {
            console.log('Error');
        }
        console.log('cust_tkt inserted');
    });
    sql = `SELECT * FROM cust_tkt`;
    connection.query(sql, (err1, res1, f1) => {
        if(err1) {
            console.log(err1 + err1.stack);
        }
        let ticketnum = res1.length;
        console.log(amt);
        console.log(ticketnum);
        for(let i=0; i < response.numofRooms; ++i) {
            sql = `INSERT INTO ticket VALUES (${ticketnum}, ${response[`hotelID`]}, ${response[`rnm${i}`]}, 
                   '${chDate.in}', '${chDate.out}')`;
                   console.log(response.hotelID);
                   connection.query(sql, (err2, res2, f2) => {
                        if(err2) {
                            console.log('Error' + err2.stack);
                        }
                   });
        }
        console.log(`The booking email id is ${userData[0].email}`);
        console.log(`The ticket id is ${ticketnum}`);
        ksql = `SELECT amount from cust_tkt where cus_email = '${userData[0].email}' and ticketID = ${ticketnum}`;
        connection.query(ksql , (err2 , res2 , f2) => {
            console.log(res2);
            let amt = res2[0].amount;
            res.render("book" , {amt})
        })
    });
    //res.send('hello ' + Object.keys(response).length );
});

module.exports = router;