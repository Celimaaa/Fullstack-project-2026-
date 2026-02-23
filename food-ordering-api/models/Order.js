const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const Order = sequelize.define("Order", {
  order_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: DataTypes.INTEGER,
  order_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  total_price: DataTypes.DECIMAL(10,2),
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending"
  },
  

}, {
  tableName: "orders",
  timestamps: false
});

module.exports = Order;