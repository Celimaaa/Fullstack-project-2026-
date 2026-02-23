const express = require("express");
require("dotenv").config();
const app = express();

const port = process.env.PORT
const User = require("./models/User.js");
const Restaurant = require("./models/Restaurant");
const { Order, OrderDetail, Menu } = require("./models");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Food Ordering API Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// DataBase
const sequelize = require("./config/database");
sequelize.authenticate()
.then(() => console.log("Database connected successfully"))
.catch(err => console.error("Database connection failed:", err));

//_____Models_____

// Post User
const bcrypt = require("bcrypt");
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.json({ message: "User registered successfully", user: newUser });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User
app.get("/users", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Put User
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await User.update(req.body, {
      where: { user_id: id }
    });

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByPk(id);
    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// Del User
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.destroy({
      where: { user_id: id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Restaurant
app.get("/restaurants", async (req, res) => {
  const restaurants = await Restaurant.findAll();
  res.json(restaurants);
});

// post Restaurant
app.post("/restaurants", async (req, res) => {
  const newRestaurant = await Restaurant.create(req.body);
  res.json(newRestaurant);
});

// Put Restaurant
app.put("/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await Restaurant.update(req.body, {
      where: { restaurant_id: id }
    });

    if (!updated) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const updatedRestaurant = await Restaurant.findByPk(id);
    res.json(updatedRestaurant);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Del Restaurant
app.delete("/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Restaurant.destroy({
      where: { restaurant_id: id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({ message: "Restaurant deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Menu
app.get("/restaurants/:id/menu", async (req, res) => {
  const menus = await Menu.findAll({
    where: { restaurant_id: req.params.id }
  });
  res.json(menus);
});

// Post Menu
app.post("/restaurants/:id/menu", async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const newMenu = await Menu.create({
      ...req.body,
      restaurant_id: id
    });

    res.status(201).json(newMenu);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Put Menu
app.put("/restaurants/:restaurantId/menu/:menuId", async (req, res) => {
  try {
    const { restaurantId, menuId } = req.params;

    const menu = await Menu.findOne({
      where: {
        menu_id: menuId,
        restaurant_id: restaurantId
      }
    });

    if (!menu) {
      return res.status(404).json({ message: "Menu not found for this restaurant" });
    }

    const { restaurant_id, menu_id, ...safeBody } = req.body;

    await menu.update(safeBody);

    res.json(menu);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Del Menu
app.delete("/restaurants/:restaurantId/menu/:menuId", async (req, res) => {
  try {
    const { restaurantId, menuId } = req.params;

    const menu = await Menu.findOne({
      where: {
        menu_id: menuId,
        restaurant_id: restaurantId
      }
    });

    if (!menu) {
      return res.status(404).json({
        message: "Menu not found for this restaurant"
      });
    }

    await menu.destroy();

    res.json({
      message: "Menu deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Post Order
app.post("/orders", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { user_id, items } = req.body;

    let totalPrice = 0;

    // Calculate total price
    for (let item of items) {
      const menuItem = await Menu.findByPk(item.menu_id);

      if (!menuItem) {
        await transaction.rollback();
        return res.status(404).json({ error: "Menu item not found" });
      }

      totalPrice += parseFloat(menuItem.price) * item.quantity;
    }

    // Create order
    const newOrder = await Order.create({
      user_id,
      total_price: totalPrice,
      status: "pending"
    }, { transaction });

    // Create order details
    for (let item of items) {
      const menuItem = await Menu.findByPk(item.menu_id);

      await OrderDetail.create({
        order_id: newOrder.order_id,
        menu_id: item.menu_id,
        quantity: item.quantity,
        price: menuItem.price
      }, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      message: "Order created successfully",
      order_id: newOrder.order_id,
      total_price: totalPrice
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
});

// Get Order by user_id
app.get("/users/:userId/orders", async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.params.userId },
      include: {
        model: OrderDetail,
        include: {
          model: Menu,
          attributes: ["menu_name"]
        }
      }
    });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Order
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: {
        model: OrderDetail,
        include: {
          model: Menu,
          attributes: ["menu_name"]
        }
      }
    });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Order by order_id
app.get("/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { order_id: req.params.orderId },
      include: {
        model: OrderDetail,
        include: {
          model: Menu,
          attributes: ["menu_name"]
        }
      }
    });

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Put Order
app.put("/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Only allow updating safe fields
    const { status, total_price } = req.body;

    await order.update({
      status: status ?? order.status,
      total_price: total_price ?? order.total_price
    });

    res.json(order);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Del Order
app.delete("/orders/:orderId", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Order not found"
      });
    }

    await OrderDetail.destroy({
      where: { order_id: orderId },
      transaction
    });

    await Order.destroy({
      where: { order_id: orderId },
      transaction
    });

    await transaction.commit();

    res.json({
      message: "Order deleted successfully"
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      error: error.message
    });
  }
});