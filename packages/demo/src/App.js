import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';

import { useSharedState } from '@shared-service/react';

import TaskItem from './TaskItem';

const useStyles = makeStyles({
  root: {
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },
  form: {
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  remaining: {
    padding: '20px 0',
  },
  list: {
    flex: 1,
  }
});

const FILTER_MAP = {
  All: () => true,
  Active: task => !task.completed,
  Completed: task => task.completed
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function App() {
  const [tasks, setTasks] = useSharedState('tasks', []);
  const [todoInput, setTodoInput] = useSharedState('taskInput', '');
  const [tab, setTab] = useState(0);
  const classes = useStyles();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const addTask = () => {
    if (!todoInput) {
      return;
    }
    const newTask = { id: Date.now(), name: todoInput, completed: false };
    setTasks([...tasks, newTask])
    setTodoInput('');
  };

  const updateTaskCompleted = (id, completed) => {
    const updatedTasks = tasks.map(task => {
      if (id === task.id) {
        return {...task, completed }
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const remainingTasks = tasks.filter(task => id !== task.id);
    setTasks(remainingTasks);
  };

  const editTask = (id, newName) => {
    const editedTaskList = tasks.map(task => {
    // if this task has the same ID as the edited task
      if (id === task.id) {
        //
        return {...task, name: newName}
      }
      return task;
    });
    setTasks(editedTaskList);
  };

  const filterTasks = tasks.filter(FILTER_MAP[FILTER_NAMES[tab]]);
  const taskList = filterTasks
    .map(task => (
      <TaskItem
        key={task.id}
        name={task.name}
        completed={task.completed}
        handleCompleteChange={(event) => {
          updateTaskCompleted(task.id, event.target.checked);
        }}
        deleteTask={() => {
          deleteTask(task.id);
        }}
        editTask={(name) => {
          editTask(task.id, name);
        }}
      />
    ));
  const tabList = FILTER_NAMES.map(name => (
    <Tab label={name} key={name} />
  ));

  return (
    <Container maxWidth="sm" className={classes.root}>
      <Typography variant="h4" component="h1">
        My TODO List
      </Typography>
      <form className={classes.form}>
        <TextField
          value={todoInput}
          onChange={(e) => {
            setTodoInput(e.target.value);
          }}
          label="TODO"
          placeholder="What needs to be done?"
          fullWidth
          multiline
          minRows={3}
          maxRows={10}
          margin="normal"
          variant="outlined"
        />
        <Button variant="contained" color="primary" onClick={addTask}>
          Add
        </Button>
      </form>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleTabChange}
        aria-label="TODO filter"
      >
        {tabList}
      </Tabs>
      <Typography variant="h6" component="h6" className={classes.remaining}>
        {filterTasks.length} tasks remaining
      </Typography>
      <List className={classes.list}>
        {taskList}
      </List>
      <Typography variant="body2" color="textSecondary" align="center">
        Powered by &nbsp;
        <Link href="https://github.com/shared-service/shared-service" target="_blank">
          Shared Service
        </Link>
      </Typography>
    </Container>
  );
}

export default App;
