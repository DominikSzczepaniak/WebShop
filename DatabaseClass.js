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
        await this.client.query('CREATE TABLE IF NOT EXISTS "Seller"(id SERIAL PRIMARY KEY, first_name VARCHAR(255), last_name VARCHAR(255), username VARCHAR(255), password VARCHAR(255), email VARCHAR(255), address VARCHAR(255), phone VARCHAR(255))');
        await this.client.query('CREATE TABLE IF NOT EXISTS "Items"(id SERIAL PRIMARY KEY, name VARCHAR(255), price VARCHAR(255), description VARCHAR(255), image VARCHAR(255), category VARCHAR(255), seller_id INTEGER REFERENCES "Seller"(id) ON DELETE CASCADE)');
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
    

}

module.exports = {Database};