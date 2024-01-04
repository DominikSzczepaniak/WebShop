const {Client} = require('pg');
class ShopItem{
    static id = 0;
    constructor(itemName, itemPrice, itemDescription, itemImage){
        this.itemName = itemName;
        this.itemPrice = itemPrice;
        this.itemDescription = itemDescription;
        this.itemImage = itemImage;
        ShopItem.id = ShopItem.id + 1;
        this.id = ShopItem.id;
        const client = new Client({
            user: 'projekt',
            host: 'localhost',
            database: 'projektweppo',
            password: 'projekt',
            port: 5432
        });
        client.connect();
        client.query('INSERT INTO "Items"(id, name, price, description, image) VALUES($1, $2, $3, $4, $5, $6, $7)', [this.id, this.itemName, this.itemPrice, this.itemDescription, this.itemImage]).finally(() => client.end());
    }
    get itemName(){
        return this._itemName;
    }
    get itemPrice(){
        return this._itemPrice;
    }
    get itemDescription(){
        return this._itemDescription;
    }
    get itemImage(){
        return this._itemImage;
    }
    get id(){
        return this._id;
    }
    set itemName(itemName){
        this._itemName = itemName;
    }
    set itemPrice(itemPrice){
        this._itemPrice = itemPrice;
    }
    set itemDescription(itemDescription){
        this._itemDescription = itemDescription;
    }
    set itemImage(itemImage){
        this._itemImage = itemImage;
    }
    set id(id){
        this._id = id;
    }

    // render(){
    //     return `
    //     <html>
    //         <head>
    //         <link rel="stylesheet" href="/css/ShopItem.css">
    //         </head>
    //         <body>
    //         <div class="item" onclick="itemClicked(${this.id})">
    //             <img src="/images/${this.itemImage}" class="itemPhoto">
    //             <h1 class="itemName">${this.itemName}</h1>
    //             <h2 class="itemPrice">${this.itemPrice}</h2>
    //             <p class="itemSellerID">${this.itemSellerID}</p>
    //             <p class="itemDescription">${this.itemDescription}</p>
    //         </div>
    //         </body>
    //         <script>
    //             function itemClicked(id) {
    //                 //todo: find in database item with given id
    //                 // const client = new Client({
    //                 //     user: 'projekt',
    //                 //     host: 'localhost',
    //                 //     database: 'projektWEPPO',
    //                 //     password: 'projekt',
    //                 //     port: 5432
    //                 // });
    //                 // client.connect();
    //                 // const res = client.query('SELECT * FROM items WHERE id = $1', [id]);
    //                 // const item = res.rows[0];
    //                 // const name = item.name;
    //                 // const price = item.price;
    //                 // const description = item.description;
    //                 // const image = item.image;
    //                 // const category = item.category;
    //                 // const seller = item.seller;
    //                 // console.log(name, price, description, image, category, seller);

    //                 // Możesz użyć window.location.href, aby przekierować na nową stronę
    //                 // np. window.location.href = '/nowa-strona?itemName=' + name + '&itemPrice=' + price + ...
    //                 // lub użyć frameworka do routingu (np. Express.js w przypadku serwera)
    //             }
    //         </script>
    //     </html>
    //     `
    // }
}

module.exports = {ShopItem};