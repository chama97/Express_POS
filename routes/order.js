const express = require("express")
const mysql = require("mysql")
const db = require("../configs/db.configs")

const connection = mysql.createConnection(db.database)
connection.connect(function (err) {
    if (err) {
        console.log(err)
    } else {
        var orderTableQuery = "CREATE TABLE IF NOT EXISTS orders(oID VARCHAR (15), date DATE, customerId VARCHAR (15), cost DOUBLE ,CONSTRAINT PRIMARY KEY (oID), CONSTRAINT FOREIGN KEY (customerId) REFERENCES customer(id) ON DELETE CASCADE ON UPDATE CASCADE)";

        connection.query(orderTableQuery, function (err, result) {
            if (result.warningCount === 0) {
                console.log("Order Table Create")
            }
        })

        var orderDetailTableQuery = "CREATE TABLE IF NOT EXISTS orderDetail(oID VARCHAR (15), itemId VARCHAR (15), qty INT, price DOUBLE, CONSTRAINT PRIMARY KEY (oID,itemId),CONSTRAINT FOREIGN KEY (oID) REFERENCES orders(oID) ON DELETE CASCADE ON UPDATE CASCADE,CONSTRAINT FOREIGN KEY (itemID) REFERENCES item(id) ON DELETE CASCADE ON UPDATE CASCADE)";

        connection.query(orderDetailTableQuery, function (err, result) {
            if (result.warningCount === 0) {
                console.log("Order Detail Table Create")
            }
        })
    }
})

const router = express.Router()

router.get("/", (req, res) => {
    var getQuery = "SELECT * FROM orders"
    connection.query(getQuery, (err, rows) => {
        if (err) console.log(err)
        res.send(rows)
    })
})

router.get("/:id", (req, res) => {
    var id=req.params.id

    var getQuery = "SELECT * FROM orders WHERE oID=?"
    connection.query(getQuery,[id], (err, rows) => {
        if (err) console.log(err)
        res.send(rows)
    })
})


router.post("/", (req, res) => {
    const oId = req.body.oID
    const date = req.body.date
    const customerId = req.body.customerId
    const cost = req.body.cost

    const orderDetail = req.body.orderDetail;


    var orderPostQuery = "INSERT INTO orders (oID ,date ,customerId, cost) VALUES (?,?,?,?)"

    connection.query(orderPostQuery, [oId, date, customerId, cost], (err) => {
        if (err) {
            console.log(err)
            res.send({"message": "Order Placing Failed"})
        } else {
            if (saveOrderDetail(res, orderDetail,oId)) {
                res.send({"message": "Order Placing Successfully"})
            }else {
                res.send({"message": "Order Placing Failed"})
            }
        }
    })
})

function saveOrderDetail(res, orderDetail,oid) {
    var orderDetailPostQuery = "INSERT INTO orderDetail (oID ,itemId ,qty,price) VALUES (?,?,?,?)"

    for (const orderDetailKey of orderDetail) {
        connection.query(orderDetailPostQuery, [oid, orderDetailKey.itemId, orderDetailKey.qty, orderDetailKey.total], (err) => {
            if (err) {
                console.log(err)
                return false;
            } else {
                if (updateItem(orderDetailKey.qty, orderDetailKey.itemId)) {

                }else {
                    return false;
                }
            }
        })
    }
    return true;
}

function updateItem(qty,itemId) {
    var itemUpdateQuery = "UPDATE item SET qty=? WHERE id=?"

    var getQuery = "SELECT * FROM item WHERE id=?"
    connection.query(getQuery, [itemId], (err, row) => {
        if (err) {
            console.log(err)
        }

        var currentQty=(+row[0].qty)-(+qty);

        connection.query(itemUpdateQuery, [currentQty,itemId], (err) => {
            if (err) {
                console.log(err)
                return false
            } else {
                return true;
            }
        })
    })
}

router.delete("/:id", (req, res) => {
    var oId = req.params.id

    var deleteQuery = "DELETE FROM orders WHERE oId=?";
    connection.query(deleteQuery, [oId], (err, rows) => {
        if (err) {
            console.log(err)
        }
        if (rows.affectedRows > 0) {
            res.send({"message": "Order Deleted Successfully"})
        } else {
            res.send({"message": "Order Not Found"})
        }
    })
})


module.exports = router