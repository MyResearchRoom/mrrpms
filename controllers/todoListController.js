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
