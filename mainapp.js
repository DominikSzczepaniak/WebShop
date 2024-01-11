const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;
const { ShopItem } = require('./ShopItemClass');
const { Database } = require('./DatabaseClass');
const { exec } = require('child_process');
const db = new Database();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/")
  },
  filename: function (req, file, cb) {
    cb(null, "tempfile.png")
  }
})
const upload = multer({ storage: storage });

async function getUsersFunction() {
  const users = await db.getUsers();
  return users;
}

function getId() {
  db.getNextItemId().then((new_id) => {
    return new_id;
  });
}

async function main() {
  await db.createDatabaseTables();
  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/css', express.static(__dirname + '/css'));
  app.use('/images', express.static(__dirname + '/images'));
  app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUnintaialized: true
  }));

  app.get('/', (req, res) => {
    req.session.error = "";
    db.getShopItems().then((shopItems) => {
      res.render('mainPage', { shopItems: shopItems, isAuth: req.session.isAuth, userId: req.session.userId, username: req.session.username, type: req.session.type });
    })
  });

  app.get('/login', (req, res) => {
    if (req.session.isAuth) {
      res.redirect('/');
    }
    else {
      if (req.session.error) {
        res.render('loginPage', { error: req.session.error });
      }
      else {
        res.render('loginPage');
      }
    }
  })

  app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const val = await db.getUserId(username, password);
    const id = val[0];
    const type = val[1];
    if (id == null) {
      req.session.error = "Wrong username or password";
      req.session.isAuth = false;
      res.redirect('/login');
    }
    else {
      req.session.isAuth = true;
      req.session.userId = id;
      req.session.username = username;
      req.session.type = type;
      res.redirect('/');
    }
  });

  app.get('/register', (req, res) => {
    if (req.session.isAuth) {
      res.redirect('/');
    }
    else {
      if (req.session.error) {
        res.render('registerPage', { error: req.session.error });
      }
      else {
        res.render('registerPage');
      }
    }
  });

  app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const type = "user";
    const result = await db.registerUser(username, password, type);
    if (result == null) {
      req.session.error = "Username taken";
      res.redirect('/register');
    }
    else {
      req.session.error = "";
      res.redirect('/');
    }
  });

  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

  //TODO:
  //search bar logic (search by name or description use KMP algorithm on names and descriptions from database)
  //add to cart (do cart on the left side as a list and checkout button at the top next to a price)
  //so something like:
  //cart icon         price  checkout button
  //item1             price  remove button
  //item2             price  remove button
  //and so on
  //checkout subpage
  //adminPanel logic
  //login i rejestracja na jednej podstronie i w ladniejszym wykonaniu estetycznym (zrob zakladki na logowanie i rejestracje na tej podstronie)
  //garbage collector - przegladaj foldar images i jesli nie jest uzywanie to usun
  //zmiana bazy danych ShopUser - kluczem ma byc userName
  //images nazwy powinny miec nazwe id_itemu.png, jesli usuwamy przedmiot to usuwamy też plik
  //przycisk ze przedmiot niedostepny


  app.get('/adminPanel', (req, res) => { //TODO
    if (req.session.isAuth && req.session.type == "admin") {
      db.getUsers().then((users) => {
        db.getOrders().then((orders) => {
          db.getShopItems().then((shopItems) => {
            res.render('adminPanelPage', { users: users, orders: orders, items: shopItems });
          });
        });
      });
    }
    else {
      res.redirect('/');
    }
  });

  app.get('/adminPanel/deleteUser/:username', (req, res) => {
    if (req.session.isAuth && req.session.type == "admin") {
      db.deleteUser(req.params.username).then(() => {
        res.redirect('/adminPanel');
      });
    }
    else {
      res.redirect('/');
    }
  });

  app.get('/adminPanel/changeOrderStatus/:id/:status', (req, res) => {
    if (req.session.isAuth && req.session.type == "admin") {
      db.changeOrderStatus(req.params.id, req.params.status).then(() => {
        res.redirect('/adminPanel');
      });
    }
    else {
      res.redirect('/');
    }
  });

  app.get('/adminPanel/deleteOrder/:id', (req, res) => {
    if (req.session.isAuth && req.session.type == "admin") {
      db.deleteOrder(req.params.id).then(() => {
        res.redirect('/adminPanel');
      });
    }
    else {
      res.redirect('/');
    }
  });

  app.get('/adminPanel/deleteItem/:id', (req, res) => {
    if (req.session.isAuth && req.session.type == "admin") {
      db.deleteItem(req.params.id).then(() => {
        res.redirect('/adminPanel');
      });
    }
    else {
      res.redirect('/');
    }
  });

  app.post('/adminPanel/addItem', upload.single('itemImage'), (req, res) => {
    //dziala NOWAY
    if (req.session.isAuth && req.session.type == "admin") {
      const name = req.body.itemName;
      const price = req.body.itemPrice;
      const description = req.body.itemDescription;
      db.checkIfItemWithNameExists(name).then((result) => {
        fileExists = result;
        if (fileExists) {
          // usun za pomoca fs plik tempfile.png z folderu images
          fs.unlink(path.join(__dirname, 'images', 'tempfile.png'), (err) => {
            if (err) {
              console.error(err)
              return
            }
          })
          res.redirect('/adminPanel');
        }
        else {
          db.getNextItemId().then((new_id) => {
            //rename tempfile.png to new_id.png
            fs.rename(path.join(__dirname, 'images', 'tempfile.png'), path.join(__dirname, 'images', new_id + '.png'), (err) => {
              if (err) {
                console.error(err)
                return
              }
            });
            db.addItem(name, price, description, new_id + ".png").then(() => {
              res.redirect('/adminPanel');
            });
          });
        };
      });
    }
    else {
      res.redirect('/');
    }
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Coś poszło nie tak!');
  });
}
main();

