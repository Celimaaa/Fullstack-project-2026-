const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderDetail = sequelize.define("OrderDetail", {
  order_detail_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: DataTypes.INTEGER,
  menu_id: DataTypes.INTEGER,
  quantity: DataTypes.INTEGER,
  price: DataTypes.DECIMAL(10,2)
}, {
  tableName: "order_details",
  timestamps: false
});

OrderDetail.belongsTo(require("./Menu"), {foreignKey: "menu_id"});

module.exports = OrderDetail;