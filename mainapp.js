const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;
const {ShopItem} = require('./ShopItemClass');
const {Database} = require('./DatabaseClass');
const db = new Database();

async function getShopItemsFunction(){
  const shopItems = await db.getShopItems();
  return shopItems;
}

async function main(){
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
    getShopItemsFunction().then((shopItems) => {
      res.render('mainPage', {shopItems: shopItems, isAuth: req.session.isAuth, userId: req.session.userId, username: req.session.username, type: req.session.type});
    })
  });

  app.get('/login', (req, res) => {
    if(req.session.isAuth){
      res.redirect('/');
    }
    else{
      if(req.session.error){
        res.render('loginPage', {error: req.session.error});  
      }
      else{
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
    if(id == null){
      req.session.error = "Wrong username or password";
      req.session.isAuth = false;
      res.redirect('/login');
    }
    else{
      req.session.isAuth = true;
      req.session.userId = id;
      req.session.username = username;
      req.session.type = type;
      res.redirect('/');
    }
  });

  app.get('/register', (req, res) => {
    if(req.session.isAuth){
      res.redirect('/');
    }
    else{
      if(req.session.error){
        res.render('registerPage', {error: req.session.error});  
      }
      else{
        res.render('registerPage');
      }
    }});

  app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const type = "user";
    const result = await db.registerUser(username, password, type);
    if(result == null){
      req.session.error = "Username taken";
      res.redirect('/register');
    }
    else{
      req.session.error = "";
      res.redirect('/');
    }
  });

  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
main();

