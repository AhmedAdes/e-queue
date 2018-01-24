var express = require("express");
var router = express.Router();
var sql = require("mssql");
var jwt = require("jsonwebtoken");
var sqlcon = sql.globalPool;


var firebase = require("firebase");
// Initialize Firebase
var config = {
  apiKey: "AIzaSyBEzZp-q-FDr6NipFRU3IHAJ0X0Ul9zNHY",
  authDomain: "equeueing-5acb7.firebaseapp.com",
  databaseURL: "https://equeueing-5acb7.firebaseio.com",
  projectId: "equeueing-5acb7",
  storageBucket: "equeueing-5acb7.appspot.com",
  messagingSenderId: "904716700018"
};
firebase.initializeApp(config);
var database = firebase.database();


router.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers["authorization"];
  var secret = req.body.salt || req.query.salt || req.headers["salt"];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        return res.status(403).send({
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }
});

router.get("/ActiveTickets/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM vwActiveTickets WHERE UserID = ${req.params.id};
            SELECT * FROM vwActiveTicketsServices WHERE UserID = ${req.params.id};`)
    .then(function (ret) {
      let Que = ret.recordsets[0]
      let Srv = ret.recordsets[1]
      Que.forEach(q => {
        q.Services = Srv.filter(s => s.QID == q.QID)
      })
      res.json(Que);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
router.get("/TicketDetails/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM vwAllQueue WHERE QID = ${req.params.id};
            SELECT * FROM vwAllQueueDetails WHERE QID = ${req.params.id};`)
    .then(function (ret) {
      let Que = ret.recordsets[0]
      let Srv = ret.recordsets[1]
      Que.forEach(q => {
        q.Services = Srv.filter(s => s.QID == q.QID)
      })
      res.json(Que);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
router.get("/TicketsHistory/:id/:vdate/:comp/:branc/:dept/:serv", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  // @UserID INT, @CompID INT, @BranchID INT, @DeptID INT, @VisitDate DATE
  request.input('UserID', req.params.id)
  request.input('CompID', req.params.comp == 'undefined'? null : req.params.comp)
  request.input('BranchID', req.params.branc == 'undefined'? null : req.params.branc)
  request.input('DeptID', req.params.dept == 'undefined'? null : req.params.dept)
  request.input('ServID', req.params.serv == 'undefined'? null : req.params.serv)
  request.input('VisitDate', req.params.vdate == 'undefined'? null : req.params.vdate)
  request
    .execute(`SearchUserTickets`)
    .then(function (ret) {
      res.json(ret.recordset);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
router.get("/SearchDetails/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT DISTINCT c.CompID, c.CompName FROM dbo.vwAllQueue q JOIN dbo.Branch b ON b.BranchID = q.BranchID 
    JOIN dbo.Company c ON c.CompID = b.CompID WHERE UserID = ${req.params.id};
    SELECT DISTINCT b.CompID, q.BranchID, b.BranchName FROM dbo.vwAllQueue q JOIN dbo.Branch b ON b.BranchID = q.BranchID WHERE UserID = ${req.params.id} ;
    SELECT DISTINCT q.BranchID, q.DeptID, d.DeptName FROM dbo.vwAllQueue q JOIN dbo.CompDept d ON d.DeptID = q.DeptID WHERE UserID = ${req.params.id};
    SELECT DISTINCT s.DeptID, q.ServID, s.ServName FROM dbo.vwAllQueueDetails q JOIN dbo.DeptServices s ON s.ServID = q.ServID
    WHERE q.QID IN (SELECT QID FROM dbo.vwAllQueue WHERE UserID = ${req.params.id});`)
    .then(function (ret) {
      res.json(ret.recordsets);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
router.get("/getToday", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  res.json(new Date());
});
router.post("/IssueNew", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  let det = req.body.tckt

  let tvp = new sql.Table()
  tvp.columns.add('QID', sql.Int)
  tvp.columns.add('DeptID', sql.Int)
  tvp.columns.add('ServID', sql.Int)
  tvp.columns.add('ServCount', sql.Int)
  tvp.columns.add('Notes', sql.NVarChar)

  for (let i = 0; i < det.srvfrm.length; i++) {
    let r = det.srvfrm[i]
    if (r.checked) {
      tvp.rows.add(r.QID, det.dept, r.ServID, r.ServCount, r.Notes);
    }
  }

  // CompID int, DeptID INT, BranchID INT, UserID INT, VisitDate Date
  let request = new sql.Request(sqlcon);
  request.input("DeptID", det.dept);
  request.input("BranchID", det.branch);
  request.input("CompID", det.comp);
  request.input("UserID", det.user);
  request.input("VisitDate", det.vDate);
  request.input("QueueDetails", tvp);
  request
    .execute(`IssueTicket`)
    .then(function (ret) {
      let qid = ret.recordset[0].QID
      firebase
        .database()
        .ref("MainQueue/" + qid)
        .set({
          QID: qid,
          VisitDate: det.vDate.split('T')[0],
          DeptID: det.dept,
          BranchID: det.branch,
          UserID: det.user,
          ServiceNo: ret.recordset[0].ServiceNo,
          UniqueNo: ret.recordset[0].UniqueNo,
          QStatus: 'Waiting'
        })
      res.json(ret.recordset[0]);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    })
})

router.put("/CancelTicket/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request.input('QID', req.params.id)
  request
    .execute(`CancelTicket`)
    .then(function (ret) {
      firebase
        .database()
        .ref("MainQueue/" + req.params.id)
        .update({
          QStatus: 'Cancelled'
        })

      res.json({
        affected: ret.rowsAffected[0]
      });
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
// CancelTicket
module.exports = router;