const express = require('express');
const { addToDo, getTodaysToDoList } = require('../controllers/todoListController');
const authenticate = require("../middlewares/authMiddleware");

const {
    ADMIN,
    CLIENT_VENDOR,
    CLIENT,
    PROJECT_COORDINATOR,
} = require("../utils/constants");

const router = express.Router();

router.post(
    "/addTodo",
    authenticate([ADMIN, PROJECT_COORDINATOR]),
    addToDo
);

router.get(
    "/getTodoList",
    authenticate([ADMIN, PROJECT_COORDINATOR]),
    getTodaysToDoList

);

module.exports = router;