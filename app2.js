const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const Task = require('./task');
const path = require('path');
const uuid = require('uuid');

const app = express();
app.use('/uploads', express.static('uploads'));
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = file.originalname;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  Task.fetchAll().then(function(tasks) {
    res.render('index', { tasks: tasks });
  });
});

app.post('/add', upload.single('attach'), urlencodedParser, function(req, res) {
  const id = uuid.v4();
  const name = req.body.name;
  const status = req.body.status;
  const deadline = req.body.deadline;
  const attach = req.file ? req.file.originalname : '';
  const task = new Task(id, name, status, deadline, attach);
  task.save();
  res.redirect('/');
});

/*app.post('/update', urlencodedParser, (req, res) => {
  const id = req.body.id;

  const name = req.body.name;
  const status = req.body.status;
  const deadline = req.body.deadline;
  const attach = req.body.attach;
  const t = new Task(id, name, status, deadline, attach);
  const task = { id, name, status, deadline, attach };
  t.updateTask(task, (err, updatedTask) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Статус задачи успешно обновлен:', updatedTask);
      res.redirect('/');
    }
  });
});*/

app.post('/update', urlencodedParser, (req, res) => {
  const id = req.body.id;
  const task = new Task();
  task.getTaskById(id, (err, taskToUpdate) => {
    if (err) {
      console.error(err);
      return res.status(404).send('Task not found');
    }

    const name = req.body.name;
    const status = req.body.status;
    const deadline = req.body.deadline;
    const attach = req.body.attach;
    const taskData = { id, name, status, deadline, attach };

    taskToUpdate.updateTask(taskData, (err, updatedTask) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error updating task');
      }
      console.log('Статус задачи успешно обновлен:', updatedTask);
      res.redirect('/');
    });
  });
});

app.listen(3000, function() {
  console.log('Server started on port 3000');
});
