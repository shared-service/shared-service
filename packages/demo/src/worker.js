import { SharedServiceWorker } from '@shared-service/core';
import localforage from 'localforage';

console.log('TODO demo with SharedService');

const sharedService = new SharedServiceWorker({
  tasks: [
    { id: 0, name: "Eat", completed: true },
    { id: 1, name: "Sleep", completed: false },
    { id: 2, name: "Repeat", completed: false }
  ],
  taskInput: '',
});
// eslint-disable-next-line no-restricted-globals
self.$sharedService = sharedService;

// Connect sharedService with SharedWorker onconnect API
// eslint-disable-next-line no-restricted-globals
self.onconnect = function(e) {
  sharedService.onConnect(e);
};

// Register executors
sharedService.registerExecutor('addTask', () => {
  const taskInput = sharedService.getState('taskInput');
  if (!taskInput) {
    return;
  }
  const tasks = sharedService.getState('tasks');
  const newTask = { id: Date.now(), name: taskInput, completed: false };
  sharedService.setState('tasks', [...tasks, newTask]);
  sharedService.setState('taskInput', '');
});
sharedService.registerExecutor('updateTaskCompleted', (id, completed) => {
  const tasks = sharedService.getState('tasks');
  const updatedTasks = tasks.map(task => {
    if (id === task.id) {
      return {...task, completed }
    }
    return task;
  });
  sharedService.setState('tasks', updatedTasks);
});
sharedService.registerExecutor('deleteTask', (id) => {
  const tasks = sharedService.getState('tasks');
  const remainingTasks = tasks.filter(task => id !== task.id);
  sharedService.setState('tasks', remainingTasks);
});
sharedService.registerExecutor('editTask', (id, newName) => {
  const tasks = sharedService.getState('tasks');
  const editedTaskList = tasks.map(task => {
    // if this task has the same ID as the edited task
    if (id === task.id) {
      //
      return {...task, name: newName}
    }
    return task;
  });
  sharedService.setState('tasks', editedTaskList);
});

async function initStorage() {
  const storage = localforage.createInstance({
    name: 'todoData',
  });
  await storage.ready();
  const keys = await storage.keys();
  const promises = keys.map((key) =>
    storage.getItem(key).then((data) => {
      sharedService.setState(key, data);
    }),
  );
  await Promise.all(promises);
  sharedService.on('stateChange', ({ key, state }) => {
    storage.setItem(key, state);
  });
}

initStorage();
