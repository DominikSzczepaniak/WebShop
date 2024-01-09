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
        await this.client.query('CREATE TABLE IF NOT EXISTS "Orders"(id SERIAL PRIMARY KEY, user_id INTEGER, item_id INTEGER, date DATE, status VARCHAR(255), quantity INTEGER, FOREIGN KEY(user_id) REFERENCES "ShopUser"(id), FOREIGN KEY(item_id) REFERENCES "Items"(id))');
        await console.log("Database tables set");
    }

    async getShopItems(){
        const result = await this.client.query('SELECT * FROM "Items"');
        return result.rows;
    }
    
    async getUserId(username, password){
        const result = await this.client.query('SELECT id, type FROM "ShopUser" WHERE username = $1 AND password = $2', [username, password]);
        if(result.rows.length == 0)
            return null;
        else
            return [result.rows[0].id, result.rows[0].type];
    }
    
    async registerUser(username, password, type){
        const check_exist = await this.client.query('SELECT * FROM "ShopUser" WHERE username = $1', [username]);
        if(check_exist.rows.length > 0)
            return null;
        const result = await this.client.query('INSERT INTO "ShopUser"(username, password, type) VALUES($1, $2, $3)', [username, password, type]);
        return result;
    }

    async getUsers(){
        const result = await this.client.query('SELECT * FROM "ShopUser" WHERE type = $1', ["user"]);
        return result.rows;
    }

    async deleteUser(username){
        const result = await this.client.query('DELETE FROM "ShopUser" WHERE username = $1', [username]);
        return result;
    }

    async getOrders(){
        const result = await this.client.query('SELECT * FROM "Orders"');
        return result.rows;
    }

    async getOrdersByUserId(user_id){
        const result = await this.client.query('SELECT * FROM "Orders" WHERE user_id = $1', [user_id]);
        return result.rows;
    }

    async getOrdersByItemId(item_id){
        const result = await this.client.query('SELECT * FROM "Orders" WHERE item_id = $1', [item_id]);
        return result.rows;
    }

    async getOrdersByStatus(status){
        const result = await this.client.query('SELECT * FROM "Orders" WHERE status = $1', [status]);
        return result.rows;
    }

    async changeOrderStatus(id, status){
        const result = await this.client.query('UPDATE "Orders" SET status = $1 WHERE id = $2', [status, id]);
        return result;
    }

    async deleteOrder(id){
        const result = await this.client.query('DELETE FROM "Orders" WHERE id = $1', [id]);
        return result;
    }
}

module.exports = {Database};