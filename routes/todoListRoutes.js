const express = require('express');
const { addToDo, getTodaysToDoList, deleteToDo, getTodaysToDoListByEmpId, updateList } = require('../controllers/todoListController');
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

router.patch(
    "/updateToDoList/:listId",
    authenticate([ADMIN, PROJECT_COORDINATOR]),
    updateList,
)

router.get("/getTodoList/:employeeId", authenticate([ADMIN]), getTodaysToDoListByEmpId);
module.exports = router;