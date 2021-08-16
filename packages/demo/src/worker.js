import { SharedServiceWorker } from '@shared-service/core';
import localforage from 'localforage';

console.log('TODO demo with SharedService');

const sharedServiceServer = new SharedServiceWorker({
  tasks: [
    { id: 0, name: "Eat", completed: true },
    { id: 1, name: "Sleep", completed: false },
    { id: 2, name: "Repeat", completed: false }
  ],
  taskInput: '',
});
// eslint-disable-next-line no-restricted-globals
self.$sharedServiceServer = sharedServiceServer;

// Connect sharedService with SharedWorker onconnect API
// eslint-disable-next-line no-restricted-globals
self.onconnect = function(e) {
  sharedServiceServer.onConnect(e);
};

// Register executors
sharedServiceServer.registerExecutor('addTask', () => {
  const taskInput = sharedServiceServer.getState('taskInput');
  if (!taskInput) {
    return;
  }
  const tasks = sharedServiceServer.getState('tasks');
  const newTask = { id: Date.now(), name: taskInput, completed: false };
  sharedServiceServer.setState('tasks', [...tasks, newTask]);
  sharedServiceServer.setState('taskInput', '');
});
sharedServiceServer.registerExecutor('updateTaskCompleted', (id, completed) => {
  const tasks = sharedServiceServer.getState('tasks');
  const updatedTasks = tasks.map(task => {
    if (id === task.id) {
      return {...task, completed }
    }
    return task;
  });
  sharedServiceServer.setState('tasks', updatedTasks);
});
sharedServiceServer.registerExecutor('deleteTask', (id) => {
  const tasks = sharedServiceServer.getState('tasks');
  const remainingTasks = tasks.filter(task => id !== task.id);
  sharedServiceServer.setState('tasks', remainingTasks);
});
sharedServiceServer.registerExecutor('editTask', (id, newName) => {
  const tasks = sharedServiceServer.getState('tasks');
  const editedTaskList = tasks.map(task => {
    // if this task has the same ID as the edited task
    if (id === task.id) {
      //
      return {...task, name: newName}
    }
    return task;
  });
  sharedServiceServer.setState('tasks', editedTaskList);
});

async function initStorage() {
  const storage = localforage.createInstance({
    name: 'todoData',
  });
  await storage.ready();
  const keys = await storage.keys();
  const promises = keys.map((key) =>
    storage.getItem(key).then((data) => {
      sharedServiceServer.setState(key, data);
    }),
  );
  await Promise.all(promises);
  sharedServiceServer.on('stateChange', ({ key, state }) => {
    storage.setItem(key, state);
  });
}

initStorage();
