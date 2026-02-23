const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderDetail = sequelize.define("OrderDetail", {
  order_detail_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: DataTypes.INTEGER,
  price: DataTypes.DECIMAL(10,2)
}, {
  tableName: "order_details",
  timestamps: false
});

module.exports = OrderDetail;