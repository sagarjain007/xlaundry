const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var nodemailer = require('nodemailer');

const app = express();

var error="";
var otp=0;
var today=date(1);
var tomorrow=date(2);
var dayaftertom=date(3);
var userID;
//var orderCount=0; this was there
var userobj;
var vieworderobj1;
var vieworderobj2;
//signup details
var reqphoneno;
var requsername;
var reqpassword;
var reqemail;
//transporter
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'email@email.com',
      pass: '*******************'
    }
  });


app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/testingDB",{ useNewUrlParser: true });


const userSchema = {
                    username:String,
                    password:String,
                    email:String,
                    phoneno:Number,
                    };

const orderSchema={
                    user_id:String,
                    serviceType:String,
                    services:Array, 
                    date:String,
                    latitude:Number,
                    longitude:Number,
                    address:String,
                    status:String,
                    money:String
                    };
const User = mongoose.model("User",userSchema);
const Order=mongoose.model("Order",orderSchema);

app.get("/",function(req,res){
    res.render("index");
});

app.get("/price",function(req,res){
    res.render("price");
});

app.get("/contact",function(req,res){
    res.render("contact");
});

app.get("/login",function(req,res){
    res.render("login",{error: ""});
});

app.get("/signup",function(req,res){
    res.render("signup");
});

app.get("/otp",function(req,res){
    res.render("otp",{error:error});
});

app.get("/order",function(req,res){
    var orderCount=0;
    Order.count({user_id: userID,status:"Order Placed"}, function (err, count) {
        console.log("count is "+count);
    orderCount=count;
});
    Order.find({user_id: userID },function(err,result){
        if(err){
            console.log(err);
        }else{
            console.log(result);
            result.reverse();
            //console.log(result.length); use result instead of count function
            //mongoose.connection.close();i closed the mongoose connection here check if its wrking (latest addition)
            res.render("order",{today:today,tomorrow:tomorrow,dayaftertom:dayaftertom,orderCount:orderCount,orders:result,userobj:userobj});

        }

    });
});
app.get("/admin",function(req,res){
    Order.find({},function(err,result){
        if(err){
            console.log(err);
        }else{
            result.reverse();
            res.render("admin",{orders:result});//res.render("admin",{orders:result,price_sent:""});
        }
    });
});
app.get("/vieworder",function(req,res){
    res.render("vieworder",{vieworderobj1:vieworderobj1,vieworderobj2:vieworderobj2});
});
/*posts requests*/

app.post("/signup",function(req,res){

     requsername=req.body.username;
     reqpassword=req.body.password;
     reqemail=req.body.email;
     reqphoneno=req.body.phoneno;

    otp=randomNum();
    //send to user
    var mailOptions = {
        from: 'email@email.com',
        to: reqemail,
        subject: 'XLaundry Signup OTP',
        text: 'Your OTP is '+otp
      };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          console.log(otp);
          error=" ";
          res.redirect("/otp");//latest change not tested
        }
      });


});

app.post("/otp",function(req,res){
    var inputotp=req.body.otp;
    inputotp=parseInt(inputotp);
    console.log("input otp"+inputotp);
    if(inputotp == otp){
        console.log("success");
        const userDetails = new User({
            username:requsername,
            password:reqpassword,
            email:reqemail,
            phoneno:reqphoneno
        });
        userDetails.save();
        setTimeout(function(){
            res.redirect("/login");
        },5000);
    }else{
        console.log("fail");
        error="Otp you entered is Incorrect"; //latest change not tested
        res.redirect("/otp");
    }


});

app.post("/",function(req,res){
    const requsername=req.body.username;
    const reqpassword=req.body.password;
    User.findOne({username:requsername,password:reqpassword},function(err,result){
        if(err){
            
            res.render("login",{error: "Oops an error occured."});
        }else{
            if(result==null){
                
                res.render("login",{error: "Incorrect Username or Password."});
            }else{
                userID=result._id;
                userobj=result;
                // redirect to order booking page
                res.redirect("/order");
            }
        }
    });   
});

app.post("/book",function(req,res){

    var reqserviceType=req.body.serviceType;
    var reqservices=[];
    if(req.body.iron==="iron"){
        reqservices.push("Iron");
    }    if(req.body.washfold==="washfold"){
        reqservices.push("washfold");
    }    if(req.body.washpress==="washpress"){
        reqservices.push("washpress");
    }    if(req.body.dryclean==="dryclean"){
        reqservices.push("dryclean");
    }
    var reqdate=req.body.date;
    var reqlatitude=parseFloat(req.body.latitude);
    var reqlongitude=parseFloat(req.body.longitude);
    var reqaddress=req.body.address;


    const userOrder = new Order({
        user_id:userID,
        serviceType:reqserviceType,
        services:reqservices,
        date:reqdate,
        latitude:reqlatitude,
        longitude:reqlongitude,
        address:reqaddress,
        status:"Order Placed",
        money:"Not Paid"
    });
    userOrder.save(); //i think use timeout here
    setTimeout(function(){
        res.redirect("/order")

    },5000);
    
});
app.post("/admin",function(req,res){
    var id=req.body.userid;
    var oid=req.body.orderid;
    Order.findOne({user_id:id,_id:oid},function(err,result1){
        if(err){
            console.log(err);
        }else{
            User.findOne({_id:id},function(err,result2){
                if(err){
                    console.log(err);
                }else{
                    vieworderobj1=result1;
                    vieworderobj2=result2;
                    res.redirect("/vieworder");
                }
            });
        }
    });
});

app.post("/vieworder",function(req,res){
    var oid=req.body.uid;
    var aorcbtn=req.body.aorcbtn;
    var eid=req.body.eid;
    var s=req.body.services;
    var price=req.body.price;
        console.log(eid);
    if(aorcbtn=="accept"){

        Order.updateOne({_id:oid},{status: "Order Confirmed"}, function(err, result){
            if(err){
                res.send(err)
            }
            else{
                                //send to user
                                var mailOptions = {
                                    from: 'email@email.com',
                                    to: eid,
                                    subject: 'Xlaundry Order No:'+oid,
                                    html: '<h6>Your XLaundry Order has been accepted.</h6><br>Thank you for ordering with Us!'
                                  };
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    }    
                                  });
                res.redirect("/admin");
            }
        });
    }else if(aorcbtn=="cancel"){
        Order.updateOne({_id:oid},{status: "Order Cancelled"}, function(err, result){
            if(err){
                res.send(err)
            }
            else{
                //send to user
                var mailOptions = {
                    from: 'email@email.com',
                    to: eid,
                    subject: 'Xlaundry Order No:'+oid,
                    html: '<h6>Your XLaundry Order has been cancelled</h6><br>For any queries kindly contact us<br>Thank you.'
                  };
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    }
                  });
                res.redirect("/admin");
            }
        });
    }
    else{
        var mailOptions = {
            from: 'email@email.com',
            to: eid,
            subject: 'Xlaundry Order No:'+oid,
            html: '<h6>Your XLaundry Order has been processed</h6><p>Services you opted:</p>'+s+'<br>Total amount to be paid '+price
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            }
          });
          res.redirect("/admin");//latest change
    }
});

/* date function */
function date(numberOfDaysToAdd){
    var someDate = new Date();
    someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
    var dd = someDate.getDate();
    var mm = someDate.getMonth() + 1;
    var y = someDate.getFullYear();
    var someDate = dd + '/'+ mm + '/'+ y;
    return (someDate);

}
// random number function
function randomNum(){
    var n=Math.random();
    n=n*100000;
    return(Math.floor(n));

}

app.get("/test",function(req,res){
    res.render("test",{testvalue:777});
});



app.listen(3000,function(){
    console.log("server started on port 3000");
});

