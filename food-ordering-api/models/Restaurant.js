const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Restaurant = sequelize.define("Restaurant", {
  Restaurant_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Restaurant_name: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING
  },
}, {
  tableName: "restaurants",
  timestamps: false
});

module.exports = Restaurant;