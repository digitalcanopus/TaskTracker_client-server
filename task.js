const fs = require('fs');
const path = require('path');
const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'tasks.json'
);

const getTasksFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      console.error(err);
      return cb([]);
    }
    cb(JSON.parse(fileContent));
  });
  console.log('read from file successfully');
};

module.exports = class Task {
  constructor(id, name, status, deadline, attach) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.deadline = deadline;
    this.attach = attach;
  }

  updateTask(task, cb) {
    getTasksFromFile((tasks) => {
      //const taskToUpdate = tasks.find(t => t.id === task.id);
      const taskToUpdate = tasks.filter(t => t.id === task.id)[0];
      console.log('TTU', taskToUpdate);
      if (!taskToUpdate) {
        return cb(new Error('Task not found'));
      }
      taskToUpdate.status = task.status;
      taskToUpdate.deadline = task.deadline;
      fs.writeFile(p, JSON.stringify(tasks), (err) => {
        if (err) {
          return cb(err);
        }
        cb(null, taskToUpdate);
      });
    });
  }

  getTaskById(id, cb) {
    console.log(id);
    fs.readFile(p, (err, data) => {
      if (err) {
        return cb(err);
      }
      const tasks = JSON.parse(data);
      const task = tasks.find(t => t.id === id);
      if (!task) {
          console.log(tasks);
          console.log(id);
        return cb(new Error(`Task with id ${id} not found`));
      }
      cb(null, task);
    });
  }

  save() {
    getTasksFromFile((tasks) => {
      tasks.push(this);
      fs.writeFile(p, JSON.stringify(tasks), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAll() {
    return new Promise((resolve, reject) => {
      getTasksFromFile((tasks) => {
        resolve(tasks);
      });
    });
  }
};

