const { DataSource } = require('typeorm');
const { User } = require('./entities/User');
const { Software } = require('./entities/Software'); // ✅ Import Software entity
const { Request } = require('./entities/Request');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [User, Software,Request], // ✅ Add Software here
});

module.exports = { AppDataSource };
