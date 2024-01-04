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
        await console.log("Database tables set");
    }

    async getCategories(){
        const result = await this.client.query('SELECT DISTINCT category FROM "Items"');
        return result.rows.map(row => row.category);
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
}

module.exports = {Database};