var express = require('express');
var router = express.Router();





//at home newtodo want to delete
router.get('/changeStateTODO', function(req, res, next) {

  console.log(' nameTODO '+req.query['todoName']+" change to "+req.query['changeTO']);
  var user_name=session.user;
  var new_entry = req.query['todoName'];
  var new_val = req.query['changeTO'];
  if(new_entry!='') {
    global.mongo.collection(user_name, function (err, collection) {
      collection.find({"note": new_entry}).toArray(function(err,item){
        if(item.length >0)
        {
          //console.log('4 condition here');

          collection.update({"note": new_entry},  { $set: { done : new_val  } }, function (err, items) {
            res.end('');
          });
        }
        else{
          res.end('');
        }
      });
    });
  }
  else
    res.end('');
});



//at home newtodo want to delete
router.get('/deleteTODO', function(req, res, next) {

  console.log(' deleteTODO '+req.query['q']);
  var user_name=session.user;
  var new_entry = req.query['q'];
  if(new_entry!='') {
    global.mongo.collection(user_name, function (err, collection) {
      collection.find({"note": new_entry}).toArray(function(err,item){
        if(item.length >0)
        {
          //console.log('it is present so  delete');
          collection.remove({"note": new_entry},{safe: true}, function (err, items) {
            res.end('');
          });
        }
        else{
          res.end('');
        }
      });
    });
  }
  else
    res.end('');
});

//home page if newtodo is added
router.get('/insertUpdateTODO', function(req, res, next) {

  console.log(' insertUpdateTODO '+req.query['q']);
  var user_name=session.user;
  var new_entry = req.query['q'];
  if(new_entry!='') {
    global.mongo.collection(user_name, function (err, collection) {
      collection.find({"note": new_entry}).toArray(function(err,item){
        if(item.length !=0)
        {
        //  console.log('entry already present rename it');
          collection.update({"note": new_entry},{"note": new_entry,done:0 , "date": new Date()}, function (err, items) {
            res.end('');
          });
        }else{
        //  console.log('entry not present');
          collection.insert({"note": new_entry,done:0 ,"date": new Date()}, function (err, items) {
            res.end('');
          });
        }
      });
    });
  }
  else
    res.end('');
});



router.get('/userFetchData', function(req, res, next) {

  //console.log(' on focus '+req.query['q']);
  var user_name=session.user;
  global.mongo.collection(user_name, function(err, collection) {
    collection.find().sort({'my_date':-1}).toArray(function(err, items) {
      //res.render('index', { title: 'user already exist' });
      console.log(' I am '+user_name);
      console.log(' I am requested for fetch data ' + items);
      res.writeHead(200, {"Content-Type": "text/plain"});
      //pass item to response
      //res.write("Already present");
      var result = JSON.stringify(items);
      res.end(result);

    });
  });
});




// ajax for check username
router.get('/checkUserNameForFocus', function(req, res, next) {

  //console.log(' on focus '+req.query['q']);
  var user_name=req.query['q'];
  global.mongo.collection('user', function(err, collection) {
    collection.find({user_name:user_name}).toArray(function(err, items) {

      if(items.length===1) {
        //res.render('index', { title: 'user already exist' });
       // console.log(' present ' + req.query['q']);
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("Already present");
      }
      else
      {
        console.log(' present ' + req.query['q']);
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("");
      }
    });
  });
});


router.get('/signup', function(req, res) {
  if(session.user!=null)  {
    //home  if already logged in
    res.render('home', { title: 'TODO', username:session.user});
  }
  else {
    res.render('signup', {title: 'TODO'});
  }
});


//register for home  from signin page
router.post('/signUpOperation', function(req, res){

  var uname= req.body.username;

  global.mongo.collection('user', function(err, collection) {
    collection.find({user_name:uname}).toArray(function(err, items) {     //check once again username

      console.log("trying to create collection for "+ uname);

      if (items.length === 0 )
      {
        var collName=uname;
        var emailId= req.body.emailid;
        var password1=req.body.password1;
        var jsonOBJ;
        //inserting the new username data into 'user' collection
        collection.insert({user_name:uname ,email_id:emailId, password:password1 });

        //creating the collection of new username
        global.mongo.createCollection(collName, function (err, collection1) {
          collection1.insert({"note": "hello" , "date" : new Date()});
          session.user =  req.body.username;
          res.render('home', { title: 'TODO', username: req.body.username});
        });
      }
      else
      {
        console.log(" technical problem");
        res.render('index', { title: 'Error in sign up !!' });
      }
    });
  });

});






//log out from home page
router.post('/logOutUser', function(req, res) {
  if(req.body.logOutme=='true') {
    console.log(session.user + " is logged out");

    session.user=null;   //make session empty
    res.render('index', {title: 'Log Out Success full'});
  }
  else {
    res.render('home', {title: 'TODO', username:session.user});
  }
});

//if someone tries to log out using url
router.get('/logOutUser', function(req, res) {
  if(req.body.logOutme=='true') {
    console.log(session.user + " is logged out");
    session.user=null;
    res.render('index', {title: 'Log Out Success full'});
  }
  else
  {
    if(session.user !=null)
      res.render('home', {title: 'TODO', username:session.user});
    else
      res.render('index', { title: 'TODO'});
  }
});




/// if some one goes directly to home page
router.get('/home', function(req, res) {
  if(session.user!=null)  {
    //home  if already logged in
    res.render('home', { title: 'TODO', username:session.user });
  }
  else {
    res.render('index', {title: 'TODO'});
  }
});



// input from index page  and sign in  --
router.post('/authenticate', function(req, res) {
  var check_username= req.body.username;
  var check_password= req.body.password1;
  global.mongo.collection('user', function (err, collection) {
    collection.find({user_name:check_username, password:check_password}).toArray(function(err,item){

      //checking first names
      console.log(check_password + " love "+check_username);

      if(item.length===0){
        console.log("login failed");
        res.render('index', { title: 'Login Failed' });
      }
      else
      {
        console.log("login success ful"+JSON.stringify(check_username));

        session.user= check_username;


        global.mongo.collection(check_username, function (err, collection) {
          collection.find().toArray(function (err, jsonOBJ) {
            console.log("check json"+ jsonOBJ);
            console.log('session: '+session.user)
            res.render('home', { title: check_username, username: req.body.username});
          });
        });
      }
    });
  });
});


//default index page i.e. sign in page
router.get('/', function(req, res, next) {
  if(session.user!=null)
  {
    //home  if already logged in
    res.render('home', {title: 'TODO', username:session.user});
  }
  else
    //res.render('index', { title: 'TODO' });
    res.render('index');


});


module.exports = router;
