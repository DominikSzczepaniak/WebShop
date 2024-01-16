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
}

module.exports = {ShopItem};