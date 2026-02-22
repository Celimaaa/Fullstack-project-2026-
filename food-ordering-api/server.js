const express = require("express");
const app = express();

const User = require("./models/User.js");
const Restaurant = require("./models/Restaurant");
const Menu = require("./models/Menu");
const Order = require("./models/Order");
const OrderDetail = require("./models/OrderDetail");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Food Ordering API Running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// DataBase
const sequelize = require("./config/database");
sequelize.authenticate()
.then(() => console.log("Database connected successfully"))
.catch(err => console.error("Database connection failed:", err));

// Models
// USER
app.get("/users", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Restaurant
app.get("/restaurants", async (req, res) => {
  const restaurants = await Restaurant.findAll();
  res.json(restaurants);
});

app.post("/restaurants", async (req, res) => {
  const newRestaurant = await Restaurant.create(req.body);
  res.json(newRestaurant);
});

// Menu
app.get("/restaurants/:id/menu", async (req, res) => {
  const menus = await Menu.findAll({
    where: { restaurant_id: req.params.id }
  });
  res.json(menus);
});

app.post("/menu", async (req, res) => {
  try {
    console.log(req.body);

    const newMenu = await Menu.create(req.body);
    res.json(newMenu);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Order
  app.post("/orders", async (req, res) => {
  try {
    const { user_id, items } = req.body;

    let totalPrice = 0;

    // คำนวณราคารวม
    for (let item of items) {
      const menuItem = await Menu.findByPk(item.menu_id);

      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      totalPrice += menuItem.price * item.quantity;
    }

    // สร้าง Order
    const newOrder = await Order.create({
      user_id,
      total_price: totalPrice
    });

    // สร้าง OrderDetails
    for (let item of items) {
      const menuItem = await Menu.findByPk(item.menu_id);

      await OrderDetail.create({
        order_id: newOrder.order_id,
        menu_id: item.menu_id,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    res.json({
      message: "Order created successfully",
      order_id: newOrder.order_id,
      total_price: totalPrice
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/orders/:user_id", async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.params.user_id },
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// Register
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
