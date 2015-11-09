var wait = require('./models/queue.js').wait;
var eat = require('./models/queue.js').eat;
var eatery = require('./models/restaraunt.js');
var passport = require('passport');
var Account = require('./models/account.js');
var bodyParser = require('body-parser');
var qr = require('qr-image');
var sendapi = require('./sendapi.js');
var sendgrid = require('sendgrid')(sendapi.user, sendapi.key);
var braintree = require('braintree');
var brainapi = require('./brainapi.js');
var mongoose = require('mongoose');


module.exports = function(app) {
  var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: brainapi.Id,
    publicKey: brainapi.publicKey,
    privateKey: brainapi.privateKey
  });

  var host = 'https://eatstuff.ngrok.com/restaraunt';
  var qrCode = qr.image(host, {
    type: 'svg'
  });
  qrCode.pipe(require('fs').createWriteStream(__dirname + '/static/img/qr_code.svg'));
  var urlencodedParser = bodyParser.urlencoded({
    extended: false
  });
  app.get('/api/form', function(req, res) {
    res.send(eatery);
  });

  function loginRequired(req, res, next) {
    if (req.user == null) {
      res.redirect('login');
    } else {
      next();
    }
  }

  app.post('/api/form', function(req, res) {
    var name = req.body.name;
    var partySize = req.body.partySize;
    var email = req.body.email;
    var intentUrl = req.body.intentUrl;
    var newUser = {
      _id: wait.user.length + 1,
      name: name,
      partySize: partySize,
      email: email,
      intentUrl: intentUrl
    };

    wait.user.push(newUser);

    wait.save(function(err) {
      if (err) {
        res.send('Error: ' + err);
      }
      res.send(true);
    });
  });

  app.get('/api/wait', function(req, res) {
    res.send(wait);
  });

  app.get('/', urlencodedParser, function(req, res) {
    res.render('index', {
      user: req.user
    });
  });

  app.get('/register', function(req, res) {
    res.render('register');
  });

  app.post('/register', urlencodedParser, function(req, res) {
    Account.register(new Account({
      username: req.body.username
    }), req.body.password, function(err, account) {
      if (err) {
        console.log(err);
        return res.render('register');
      }

      passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/register'
      });
    });
  });

  app.get('/login', function(req, res) {
    res.render('login', {
      user: req.user
    });
  });

  app.post('/login', urlencodedParser, passport.authenticate('local'), function(req, res) {
    res.redirect('/admin');
  });

  app.get('/admin', loginRequired, function(req, res) {
    var queueData = wait;
    res.render('admin', {
      queue: queueData
    });
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/restaraunt', function(req, res) {
    res.json(eatery);
  });

  app.get('/queue-update', function(req, res) {
    var userToPop = wait.user[0];
    var notification = new sendgrid.Email({
      to: userToPop.email,
      from: 'dogeChef@eatstuff.com',
      subject: 'Your table is much ready',
      text: 'So food, such table. When you are done eating and need the check click the link eatStuffz://test',
      filters: {
        templates: {
          settings: {
            enable: 1,
            template_id: '5997fcf6-2b9f-484d-acd5-7e9a99f0dc1f'
          }
        }
      }
    });
    sendgrid.send(notification, function(err, json) {
      if (err) {
        return console.error(err);
      }
      console.log(json);
    });
    wait.user.shift();
    res.redirect('/admin');
  });

  app.get('/client_token', function(req, res) {
    gateway.clientToken.generate(null, function(err, response) {
      res.json(response);
    });
  });

  app.post('/purchase', urlencodedParser, function(req, res) {
    var nonce = req.body.payment_method_nonce;
    console.log(nonce);

    gateway.customer.create({
      firstName: 'Leaf',
      lastName: 'C',
      paymentMethodNonce: nonce
    }, function(err, result) {

      customerId = result.customer.id;
    });

  });

  app.post('/buy', urlencodedParser, function(req, res) {
    var nonce = customer.paymentMethodNonce;

    var item = 'dodgeBurger';
    var sale = {
      amount: '20.00',
      customerId: customerId
    };

    gateway.transaction.sale(sale, function(err, response) {
      if (err) {
        console.log('err');
        return;
      }

      var notification = new sendgrid.Email({
        to: userToPop.email,
        from: 'dogeChef@eatstuff.com',
        subject: 'When you are ready for the check',
        text: 'You paypal account was charged ' + sale.amount,
        filters: {
          templates: {
            settings: {
              enable: 1,
              template_id: '5997fcf6-2b9f-484d-acd5-7e9a99f0dc1f'
            }
          }
        }
      });
      sendgrid.send(notification, function(err, json) {
        if (err) {
          return console.error(err);
        }
        console.log(json);

      });
      res.json(response);


    });


  });

};
