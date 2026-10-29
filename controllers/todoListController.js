const { TodoList } = require("../models");

exports.addToDo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { task, date } = req.body;

    const today = new Date().toISOString().split("T")[0];

    const newTodo = await TodoList.create({
      userId,
      task,
      date: date || today,
    });

    return res.status(200).json({
      success: true,
      message: "Task added successfully",
      data: newTodo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add task",
    });
  }
};

exports.getTodaysToDoList = async (req, res) => {
  try {
    const userId = req.user.id;

    // const today = new Date().toISOString().split("T")[0];
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const toDoList = await TodoList.findAll({
      where: {
        userId,
        // date: today
        date,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Today's to-do list",
      data: toDoList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get today's to-do list",
    });
  }
};

exports.deleteToDo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleteTodo = await TodoList.destroy({
      where: {
        id,
        userId,
      },
    });

    if (!deleteTodo) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

exports.getTodaysToDoListByEmpId = async (req, res) => {
  try {
    const userId = req.params.employeeId;

    // const today = new Date().toISOString().split("T")[0];
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const toDoList = await TodoList.findAll({
      where: {
        userId,
        // date: today
        date,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Today's to-do list",
      data: toDoList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get today's to-do list",
    });
  }
};

exports.updateList = async (req, res) => {
  try {
    const {listId: id } = req.params;
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Todo list id is required",
      });
    }

    const toDoList = await TodoList.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!toDoList) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await toDoList.update({
      isCompleted: !toDoList.isCompleted,
    });

    return res.status(200).json({
      success: true,
      message: "To-do list updated successfully",
      data: toDoList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update to-do list status",
    });
  }
};