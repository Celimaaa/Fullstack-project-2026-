const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("food_ordering", "root", "0801194904", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;