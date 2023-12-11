const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const {ShopItem} = require('./ShopItemClass');
const {Database} = require('./DatabaseClass');
const db = new Database();

async function getShopItemsFunction(){
  const shopItems = await db.getShopItems();
  return shopItems;
}
async function getCategoriesFunction(){
  const categories = await db.getCategories();
  return categories;
}

async function main(){
  await db.createDatabaseTables();
  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/css', express.static(__dirname + '/css'));
  app.use('/images', express.static(__dirname + '/images'));


  app.get('/', (req, res) => {
    getShopItemsFunction().then((shopItems) => {
      getCategoriesFunction().then((categories) => {
        console.log(shopItems);
        res.render('mainPage', {shopItems: shopItems, categories: categories});
      })
    })
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
main();

