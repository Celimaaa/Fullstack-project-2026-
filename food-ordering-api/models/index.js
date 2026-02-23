const Order = require("./Order");
const OrderDetail = require("./OrderDetail");
const Menu = require("./Menu");

// Associations

Order.hasMany(OrderDetail, {
  foreignKey: "order_id"
});

OrderDetail.belongsTo(Order, {
  foreignKey: "order_id"
});

OrderDetail.belongsTo(Menu, {
  foreignKey: "menu_id"
});

Menu.hasMany(OrderDetail, {
  foreignKey: "menu_id"
});

module.exports = {
  Order,
  OrderDetail,
  Menu
};