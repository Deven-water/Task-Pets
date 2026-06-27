const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  save: (data) => ipcRenderer.send('save', data),
  load: () => ipcRenderer.invoke('load'),
  notify: (data) => ipcRenderer.send('notify', data),
  completeTask: (index) => ipcRenderer.send('complete-task', index),
  onTaskCompleted: (callback) => ipcRenderer.on('task-completed', (_, index) => callback(index)),
});