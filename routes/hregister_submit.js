var express = require('express');
var bodyparser = require('body-parser');
const mysql = require('mysql2');
const router = express.Router();
var db_connecton_path = './db_connection';
var connection = require(db_connecton_path);
var urlEncoder = bodyparser.urlencoded({ extended: false });
router.use(express.static(__dirname + '/public'));

const multer = require('multer')
const path = require('path')
router.use(bodyparser.json())
router.use(bodyparser.urlencoded({
    extended: true
}))
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
router.post('/hotel_create', urlEncoder, upload.single('himage'), (req, res) =>  {
    response = req.body;
    var otherDetailsCount = 3;
    var hotelTableName = 'Hotel_Table';
    var HName = 'HName';
    var address = 'address';
    var Hdesc = 'Hdesc';
    //INSERT INTO HOTEL TABLE
    if (!req.file) {
        console.log("No file upload");
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://127.0.0.1:3000/public/images/' + req.file.filename
        var insertData = "INSERT INTO hotel_img(imgsrc)VALUES(?)"
        connection.query(insertData, [imgsrc], (err, result) => {
            // if (err) throw err
            console.log("file uploaded");
            console.log();

        })
    }
    let sql = `INSERT INTO ${hotelTableName} (${HName}, ${address}, ${Hdesc}) 
               VALUES ('${response.hname}','${response.haddr}','${response.hdesc}')`;
    connection.query(sql, function(error, result) {
        if(error) {
            console.log('Error' + error.stack);
        }
        console.log('Hotel Details inserted into hotel table');
    });

    sql = `SELECT * FROM ${hotelTableName}`;
    var hotelCount = 1;
    connection.query(sql, function(error, result) {
        if(error) {
            console.log('Error' + error.stack);
        }
        console.log('Hotels Count - ' + result.length);
        hotelCount = result.length;
        sql = `CREATE TABLE Room_${hotelCount} (Room_num integer NOT NULL AUTO_INCREMENT, Room_type varchar(100), 
                                                Cost float(20), PRIMARY KEY(Room_num))`;
        connection.query(sql, function(error, result) {
            if(error) {
                console.log('Error' + error.stack);
            }
            console.log('New Table for Room created');
        });
        var roomTypeCount = (Object.keys(response).length-otherDetailsCount)/3;
        var totalRoomCount = 0;
        for(let i=1;i<=roomTypeCount;++i) {
            //console.log('Room Type ' + i + ' : ' + response[`rtype${i}`]);
            totalRoomCount = response[`rtype${i}num`];
            for(let j=1; j<=totalRoomCount; ++j) {
                let sql = `INSERT INTO Room_${hotelCount} (Room_type, Cost) 
                        VALUES ('${response[`rtype${i}`]}','${response[`rtype${i}cost`]}')`;
                connection.query(sql, function(error, result) {
                    if(error) {
                        console.log('Error' + error.stack);
                    }
                    //console.log('Hotel Details inserted into hotel table');
                }); 
            }
        }
        res.redirect('http://localhost:3000/');
    });
});

module.exports = router;