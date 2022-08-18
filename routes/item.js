const express = require('express')
const router = express.Router()
const mysql=require('mysql')
const db=require('../configs/db.configs')


const connection=mysql.createConnection(db.database);

connection.connect(function (err){
    if(err){
        console.log(err)
    }else {
        var itemTableQuery="CREATE TABLE IF NOT EXISTS item(id VARCHAR (255) PRIMARY KEY, description VARCHAR (255), unitPrice DOUBLE, qty INT)"
        connection.query(itemTableQuery,function (err,result){
            if(result.warningCount === 0){
                console.log("Item table created!");
            }
        })
    }
})


router.get('/', (req, res) => {
    var query="SELECT * FROM item"
    connection.query(query,(err,rows)=>{
        res.send(rows);
    })
});


router.post('/',(req,res)=>{
    const id=req.body.id;
    const description=req.body.description;
    const unitPrice=req.body.unitPrice;
    const qty=req.body.qty;

    var query="INSERT INTO item (id, description, unitPrice, qty)VALUES (?,?,?,?)";

    connection.query(query,[id,description,unitPrice,qty],(err)=>{
        if (err) {
            res.send({ 'message': 'duplicate entry' })
        } else {
            res.send({ 'message': 'Item created!' })
        }
    })
});


router.delete('/:id', (req, res) => {
    const id = req.params.id
    var query = "DELETE FROM item WHERE id=?";

    connection.query(query, [id], (err, rows) => {
        if (err) console.log(err);

        if (rows.affectedRows > 0) {
            res.send({ 'message': 'item deleted' })
        } else {
            res.send({ 'message': 'item not found' })
        }
    })
})


router.put('/',(req,res)=>{
    const id=req.body.id;
    const description=req.body.description;
    const unitPrice=req.body.unitPrice;
    const qty=req.body.qty;

    var query = "UPDATE item SET description=?, unitPrice=?, qty=? WHERE id=?";
    connection.query(query, [description, unitPrice,qty, id], (err, rows) => {
        if (err) console.log(err);

        if (rows.affectedRows > 0) {
            res.send({ 'message': 'item updated' })
        } else {
            res.send({ 'message': 'item not found' })
        }
    })
})


router.get('/:id', (req, res) => {
    const id = req.params.id
    var query = "SELECT * from item WHERE id=?";

    connection.query(query, [id], (err, row) => {
        if(err) console.log(err);
            res.send(row)
    })
})


module.exports = router