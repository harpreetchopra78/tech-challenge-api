const express = require('express');
const cors = require('cors')
require('dotenv').config();
const app = express()

const port = process.env.NODE_PORT
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { User, Item } = require("./db/models");
const axios = require('axios');
const { isAuth } = require('./utils');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', (req, res) => {
  res.status(200).send("OK");
});

app.post('/users', (req, res) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (req.body.email && req.body.firstName && req.body.lastName && req.body.password && emailRegex.test(req.body.email)) {
    User.create({
      ...req.body, password: bcrypt.hashSync(req.body.password)
    })
      .then(() => {
        res.status(200).send("User created successfully.")
      })
      .catch((error) => {
        res.status(500).send(`${error}`);
      });
  }
  else {
    res.status(400).send("Mandatory fields missing");
  }
});

app.post('/login', (req, res) => {
  if (req.body.email && req.body.password) {
    User.findOne({
      where: {
        email: req.body.email
      }
    })
      .then((User) => {
        if (User && bcrypt.compareSync(req.body.password, User.password)) {
          const payload = User.toJSON();
          delete payload.password;
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
          res.status(200).send({
            token: token
          });
        }
        else {
          res.status(401).send("Incorrect password or user doesn't exist");
        }
      })
  }
  else {
    res.status(400).send("Mandatory fields missing")
  }
});

app.post('/getItems', isAuth, (req, res) => {
  axios.get(`https://newsapi.org/v2/top-headlines`, {
    params: { ...req.body, pageSize: 12, apiKey: process.env.NEWS_API_API_KEY }
  })
    .then((response) => {
      res.status(200).send(response.data);
    })
    .catch((error) => {
      res.status(500).send(`${error}`);
    });
});

app.post('/addUserItem', isAuth, (req, res) => {
  Item.findOrCreate({
    where: {
      user_id: req.body.user_id,
      url: req.body.item.url,
    },
    defaults: {
      user_id: req.body.user_id,
      url: req.body.item.url,
      sourceName: req.body.item.source.name,
      country: req.body.item.country,
      category: req.body.item.category,
      title: req.body.item.title,
      description: req.body.item.description,
      url: req.body.item.url,
      urlToImage: req.body.item.urlToImage,
      publishedAt: req.body.item.publishedAt,
    }
  })
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(`${error}`);
    });
});

app.post('/getUserItems', isAuth, (req, res) => {
  Item.findAll({
    where: {
      user_id: req.body.user_id
    }
  })
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(`${error}`);
    });
});

app.post('/userItem/comment', isAuth, (req, res) => {
  console.log(req.body);
  Item.update(
    {
      comment: req.body.comment
    },
    {
      where: {
        user_id: req.body.user_id,
        url: req.body.item.url
      }
    })
    .then(() => {
      res.status(200).send("Item updated successfully");
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(`${error}`);
    });
})

app.post('/deleteUserItem', isAuth, (req, res) => {
  Item.destroy({
    where: {
      user_id: req.body.user_id,
      url: req.body.item.url
    }
  })
    .then(() => {
      res.status(200).send("Item delted successfully");
    })
    .catch((error) => {
      res.status(500).send(`${error}`);
    });
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
