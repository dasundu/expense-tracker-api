const Goal = require('../models/Goal');
const { createNotification } = require('./notificationController');

// Add a new financial goal
const addGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, autoAllocate } = req.body;
    const goal = new Goal({
      user: req.user._id,
      title,
      targetAmount,
      deadline,
      autoAllocate,
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal', error: error.message });
  }
};

// Get all user goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
};

// Update a goal's current amount, autoAllocate, title, or targetAmount
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.title = req.body.title ?? goal.title; // Update title if provided
    goal.targetAmount = req.body.targetAmount ?? goal.targetAmount; // Update targetAmount if provided
    goal.currentAmount = req.body.currentAmount ?? goal.currentAmount;
    goal.autoAllocate = req.body.autoAllocate ?? goal.autoAllocate;

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await goal.deleteOne();
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal', error: error.message });
  }
};

// Check goal reminders for approaching deadlines
const checkGoalReminders = async () => {
  const goals = await Goal.find();
  const now = new Date();

  for (let goal of goals) {
    if (goal.deadline && new Date(goal.deadline) <= now && !goal.isAchieved) {
      await createNotification(goal.user, `Reminder: You're approaching your goal deadline for "${goal.title}"!`, 'Goal Reminder');
    }
  }
};

module.exports = { addGoal, getGoals, updateGoal, deleteGoal, checkGoalReminders };
