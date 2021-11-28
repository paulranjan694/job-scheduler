const addServer = document.getElementById("add_server");
const removeServer = document.getElementById("remove_server");
const addTask = document.getElementById("add_task");
const taskInput = document.getElementById("task__input");
const servers = document.getElementById("servers");
const tasks = document.getElementById("tasks");

let serverQueue = []; //stack
let taskQueue = []; //queue
let serverStatus = {}; //reln between task and server
let serverToBeRemoved = 0;

const addingServer = () => {
  const serverId = Date.now();
  const server = document.createElement("div");
  server.id = serverId;
  server.className = "server";
  serverStatus[serverId] = 0;
  serverQueue.push(serverId);
  servers.appendChild(server);
  if (taskQueue.length) {
    syncTask();
  }
};

window.addEventListener("load", function () {
  addingServer();
});

addServer.addEventListener("click", function () {
  addingServer();
});

removeServer.addEventListener("click", function () {
  if (serverQueue.length == 0) {
    alert("Please add server!!!");
    return;
  }
  ++serverToBeRemoved;
  document.querySelector(
    ".text"
  ).textContent = `Server to be removed : ${serverToBeRemoved}`;
  if (removeServerFromUi()) {
    --serverToBeRemoved;
    document.querySelector(
      ".text"
    ).textContent = `Server to be removed : ${serverToBeRemoved}`;
  }
});

addTask.addEventListener("click", function () {
  if (serverQueue.length == 0) {
    alert("Please add server!!!");
    return;
  }
  let task = taskInput.value;
  if (task.length === 0 || task === "0") {
    alert("Please enter the number of tasks!!");
    return;
  }
  for (let i = 0; i < parseInt(task); i++) {
    const taskId = Date.now() + i;
    taskQueue.push(taskId);
  }
  syncTask();
});

function syncTask() {
  for (const [k, v] of Object.entries(serverStatus)) {
    if (v == 0 || v == undefined) {
      addTaskToServer(k);
    }
  }
  updateWaitingTaskUi();
}

function addTaskToServer(k) {
  serverStatus[k] = taskQueue[0];
  taskQueue.shift();
  let task = updateOnGoingTaskUi(k);

  setTimeout(function () {
    if (task) {
      task.remove();
    }
    serverStatus[k] = 0;
    if (taskQueue.length) {
      syncTask();
    }
    if (serverToBeRemoved > 0) {
      let response = removeServerFromUi();
      if (response) {
        --serverToBeRemoved;
        document.querySelector(
          ".text"
        ).textContent = `Server to be removed : ${serverToBeRemoved}`;
      }
    }
  }, 20000);
}

function rePaintWaitingTaskUi() {
  const waitingTasks = document.querySelectorAll(".task-group");
  for (let i = 0; i < waitingTasks.length; i++) {
    waitingTasks[i].remove();
  }
}

function updateWaitingTaskUi() {
  rePaintWaitingTaskUi();
  for (let i = 0; i < taskQueue.length; i++) {
    const taskGrpEl = document.createElement("div");
    taskGrpEl.className = "task-group";
    taskGrpEl.innerHTML = `
            <div class="task" id=${taskQueue[i]}>
            <div class="task__inner">
                <p>waiting...</p>
            </div>
            </div>
            <div class="task-delete-btn">
                <i class="fas fa-trash-alt"></i>
            </div>
        `;
    tasks.append(taskGrpEl);

    const deleteBtn = taskGrpEl.querySelector(".task-delete-btn");
    deleteBtn.addEventListener("click", function () {
      taskGrpEl.remove();
      taskQueue.splice(i, 1);
      updateWaitingTaskUi();
    });
  }
}

function updateOnGoingTaskUi(k) {
  const task = document.createElement("div");
  task.id = serverStatus[k];
  task.className = "task server-task";
  task.id = serverStatus[k];
  task.innerHTML = `<div class="task__inner"></div>`;
  if (task) {
    task.querySelector(".task__inner").classList.add("task-animation");
  }
  document.getElementById(k).append(task);
  return task;
}

function removeServerFromUi() {
  const removingServer = document.querySelectorAll(".server");
  let removeId;
  if (serverStatus[serverQueue[serverQueue.length - 1]] == 0) {
    removeId = serverQueue[serverQueue.length - 1];
    delete serverStatus[removeId];
    serverQueue.pop();
  } else {
    for (const [k, v] of Object.entries(serverStatus)) {
      if (v == 0) {
        removeId = k;
      }
    }
  }
  if (removeId == undefined) {
    return false;
  }

  for (let i = 0; i < removingServer.length; i++) {
    if (removeId == removingServer[i].id) {
      removingServer[i].remove();
    }
  }
  return true;
}
