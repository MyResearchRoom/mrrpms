const express = require('express');
const { addToDo, getTodaysToDoList, deleteToDo } = require('../controllers/todoListController');
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

router.delete(
    "/deleteTodo/:id",
    authenticate([ADMIN, PROJECT_COORDINATOR]),
    deleteToDo
);
module.exports = router;