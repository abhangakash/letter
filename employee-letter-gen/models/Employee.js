const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  emp_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  job_role: { type: String, required: true },
  department: { type: String, required: true },
  date_of_joining: { type: Date, required: true },
  current_salary: { type: Number, required: true },
  increment_percentage: { type: Number, required: true },
  new_salary: { type: Number, required: true },
  effective_date: { type: Date, required: true },
  manager_name: { type: String },
  location: { type: String },
  employee_type: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract'], default: 'Full-Time' }
});

module.exports = mongoose.model('Employee', employeeSchema);