const {Client} = require('pg');
class Database{
    constructor(){
        this.client = new Client({
            user: 'projekt',
            host: 'localhost',
            database: 'projektweppo',
            password: 'projekt',
            port: 5432
            });
        this.client.connect();
    }

    async createDatabaseTables(){
        await this.client.query('CREATE TABLE IF NOT EXISTS "ShopUser"(id SERIAL PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), type VARCHAR(5))');
        await this.client.query('CREATE TABLE IF NOT EXISTS "Items"(id SERIAL PRIMARY KEY, name VARCHAR(255), price VARCHAR(255), description VARCHAR(255), image VARCHAR(255))');
        await this.client.query('CREATE TABLE IF NOT EXISTS "Orders"(id SERIAL PRIMARY KEY, user_id INTEGER, item_id INTEGER, date VARCHAR(255), status VARCHAR(255), quantity INTEGER, FOREIGN KEY(user_id) REFERENCES "ShopUser"(id), FOREIGN KEY(item_id) REFERENCES "Items"(id))');
        await console.log("Database tables set");
    }

    async getShopItems(){
        const result = await this.client.query('SELECT * FROM "Items"');
        return result.rows;
    }
    
    async getUserId(username, password){
        const result = await this.client.query('SELECT id, type FROM "ShopUser" WHERE username = $1 AND password = $2', [username, password]);
        if(result.rows.length === 0)
            return null;
        else
            return [result.rows[0].id, result.rows[0].type];
    }
    
    async registerUser(username, password, type){
        const check_exist = await this.client.query('SELECT * FROM "ShopUser" WHERE username = $1', [username]);
        if(check_exist.rows.length > 0)
            return null;
        return await this.client.query('INSERT INTO "ShopUser"(username, password, type) VALUES($1, $2, $3)', [username, password, type]);
    }

    async getUsers(){
        const result = await this.client.query('SELECT * FROM "ShopUser" WHERE type = $1', ["user"]);
        return result.rows;
    }

    async deleteUser(username){
        var user_id = await this.client.query('SELECT id FROM "ShopUser" WHERE username = $1', [username]);
        user_id = user_id.rows[0].id;
        await this.client.query('DELETE FROM "Orders" WHERE user_id = $1', [user_id]);
        return await this.client.query('DELETE FROM "ShopUser" WHERE username = $1', [username]);
    }

    async getOrders(){
        const result = await this.client.query('SELECT * FROM "Orders"');
        return result.rows;
    }

    async getOrdersByUserId(user_id){
        const result = await this.client.query('SELECT * FROM "Orders" WHERE user_id = $1', [user_id]);
        return result.rows;
    }

    async changeOrderStatus(id, status){
        return await this.client.query('UPDATE "Orders" SET status = $1 WHERE id = $2', [status, id]);
    }

    async deleteOrder(id){
        return await this.client.query('DELETE FROM "Orders" WHERE id = $1', [id]);
    }

    async getNextItemId(){
        const result = await this.client.query(`Select nextval(pg_get_serial_sequence('"Items"', 'id')) as new_id`);
        return result.rows[0].new_id;   
    }

    async addItem(name, price, description, image){
        return await this.client.query('INSERT INTO "Items"(name, price, description, image) VALUES($1, $2, $3, $4)', [name, price, description, image]);
    }

    async checkIfItemWithNameExists(name){
        const result = await this.client.query('SELECT * FROM "Items" WHERE name = $1', [name]);
        return result.rows.length > 0;
    }

    async deleteItem(id){
        await this.client.query('DELETE FROM "Orders" WHERE item_id = $1', [id]);
        return await this.client.query('DELETE FROM "Items" WHERE id = $1', [id]);
    }

    async getItemIdByName(name){
        const result = await this.client.query('SELECT id FROM "Items" WHERE name = $1', [name]);
        return result.rows[0].id;
    }

    async placeOrder(user_id, item_id, date, status, quantity){
        return await this.client.query('INSERT INTO "Orders"(user_id, item_id, date, status, quantity) VALUES($1, $2, $3, $4, $5)', [user_id, item_id, date, status, quantity]);
    }
}

module.exports = {Database};