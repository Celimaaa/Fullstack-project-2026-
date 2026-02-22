const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Menu = sequelize.define("Menu", {
  menu_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  restaurant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  menu_name: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.DECIMAL(10,2),
  image_url: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: "available"
  }
}, {
  tableName: "MENU",
  timestamps: false
});

module.exports = Menu;