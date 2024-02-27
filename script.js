const form = document.querySelector(".modal__window__form");
const mainTask = document.querySelector(".main__task");
const errorBlock = document.querySelector(".modal__window__form__error");

const btnFilterAllTask = document.querySelector(".btnFilterAllTask");
const btnFilterInProcess = document.querySelector(".btnFilterInProcess");
const btnFilterDone = document.querySelector(".btnFilterDone");

const close = document.querySelector(".modal__window__close");
const btnShowForm = document.querySelector(".main__addTask__btnShowForm");
const modal = document.querySelector(".modal");

const btnReset = document.querySelector(".btnReset");

// инициализация хранилища
const initLocalStorage = () => {
  if (!localStorage.getItem("todo")) {
    localStorage.setItem("todo", JSON.stringify([]));
  }
};

// получение данных из хранилища
const getLocalStoragData = () => {
  return JSON.parse(localStorage.getItem("todo"));
};

// обновление хранилища
const updateLocalStorage = (data) => {
  localStorage.setItem("todo", JSON.stringify(data));
};

// добавление в хранилище
const setLocalStoragData = (task) => {
  const prevValue = getLocalStoragData();
  const newValue = [...prevValue, task];
  updateLocalStorage(newValue);
};

// получение значений инпутов
const getInputValue = (inputs) => {
  const arr = Array.from(inputs);
  const obj = { id: generateId(), completed: false };
  arr.forEach((item) => {
    obj[item["id"]] = item.value;
  });
  return obj;
};

// генератор id
const generateId = (function () {
  let start = parseInt(localStorage.getItem("lastId")) || 0;
  return () => {
    start++;
    localStorage.setItem("lastId", start);
    return start;
  };
})();

// сортировка списка
const sortTasks = (tasks) => {
  return [
    ...tasks.filter((task) => task.completed !== true),
    ...tasks.filter((task) => task.completed === true),
  ];
};

// инициализация списка
const initTask = () => {
  const sortTaskArr = sortTasks(getLocalStoragData());
  const prevTasks = sortTaskArr.map((task) => prevTask(task));
  prevTasks.forEach((task) => addTaskToContainer(task));
};

// фильтр списка
const filteredTasksActivTab = (tasks, method) => {
  if (method === "completed") {
    return tasks.filter((task) => task.completed);
  } else if (method === "noCompleted") {
    return tasks.filter((task) => !task.completed);
  }
  return [
    ...tasks.filter((task) => !task.completed),
    ...tasks.filter((task) => task.completed),
  ];
};

// рендер списков в зависимости от вкладки
const changeActiveTab = (tasks) => {
  let filteredTasks = [];
  if (activeTab === "completed") {
    filteredTasks = filteredTasksActivTab(tasks, "completed");
    reRenderTasks(filteredTasks);
  } else if (activeTab === "noCompleted") {
    filteredTasks = filteredTasksActivTab(tasks, "noCompleted");
    reRenderTasks(filteredTasks);
  } else {
    filteredTasks = filteredTasksActivTab(tasks, "all");
    reRenderTasks(filteredTasks);
  }
  return filteredTasks;
};

// добавление в список
const addTask = (task) => {
  setLocalStoragData(task);
  const cardTask = prevTask(task);
  addTaskToContainer(cardTask);
  getTitle(getLocalStoragData());
};

// добавление в контейнер
const addTaskToContainer = (task) => {
  mainTask.append(task);
  const btnsDel = document.querySelectorAll(".btnDel");
  const checkboxes = document.querySelectorAll(
    ".main__task__btnBlock__checkbox"
  );
  checkboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", handleCheckbox)
  );
  btnsDel.forEach((btn) => btn.addEventListener("click", handleBtnDel));
};

// отправка формы
const handleForm = (e) => {
  e.preventDefault();
  const inputs = e.target.querySelectorAll("input");
  const task = getInputValue(inputs);

  if (task.inputTitle !== "") {
    addTask(task);
    closeModal();
  } else {
    errorBlock.innerHTML = "заполни поле";
    inputFocus();
  }

  const sortTaskArr = sortTasks(getLocalStoragData());
  reRenderTasks(sortTaskArr);
  inputs.forEach((input) => (input.value = ""));
};

// чекбокс
const handleCheckbox = (e) => {
  const taskCard = e.target.closest(".main__task__listBlock");
  const taskId = +taskCard.dataset.id;
  const tasks = getLocalStoragData();
  const filteredTasks = tasks.map((task) => {
    if (task.id === taskId) {
      task.completed = e.target.checked;
    }
    return task;
  });
  updateLocalStorage(filteredTasks);
  const taskActive = changeActiveTab(filteredTasks);
  getTitle(taskActive);
};

// удаление из списка
const handleBtnDel = (e) => {
  const task = e.target.closest(".main__task__listBlock");
  const taskId = +task.dataset.id;
  const tasks = getLocalStoragData();

  mainTask.removeChild(task);

  const filteredTasks = tasks.filter((task) => task.id !== taskId);
  updateLocalStorage(filteredTasks);
  const taskActive = changeActiveTab(filteredTasks);
  getTitle(taskActive);
};

// ререндеринг списка
const reRenderTasks = (prevTasks) => {
  const prepared = prevTasks.map((task) => prevTask(task));
  taskContainerClear();
  prepared.forEach((task) => addTaskToContainer(task));
};

// очистка контейнера
const taskContainerClear = () => {
  mainTask
    .querySelectorAll(".main__task__listBlock")
    .forEach((task) => mainTask.removeChild(task));
};

// фильтрация списка в зав-ти от вкладки
const handleBtnFilter = (e) => {
  const btn = e.target;
  activeTab = btn.id;
  const tasks = getLocalStoragData();
  const taskActive = changeActiveTab(tasks);
  activeNav(btn);
  getTitle(taskActive);
  displayBlockAddTask();
};

// стили для навигации
const activeNav = (btn) => {
  const allButtons = document.querySelectorAll(".nav__btn");
  allButtons.forEach((button) => {
    if (button !== btn) {
      button.classList.remove("activeBtn");
    }
  });
  btn.classList.add("activeBtn");
};

// стили для блока добавления задач
const displayBlockAddTask = () => {
  const blockAddTask = document.querySelector(".main__addTask");
  if (activeTab !== "all") {
    blockAddTask.style.display = "none";
  } else {
    blockAddTask.style.display = "flex";
  }
};

// заголовок страницы
const getTitle = (tasks) => {
  const title = document.querySelector(".main__title");

  if (tasks?.length > 0) {
    if (activeTab === "completed") {
      title.innerHTML = "Выполненные задачи:";
    } else if (activeTab === "noCompleted") {
      title.innerHTML = "Список активных дел:";
    } else {
      title.innerHTML = "Все задачи:";
    }
  } else {
    title.innerHTML = "Список задач пуст";
  }
};

// очистка блока с ошибкой
const errorBlockClear = () => {
  errorBlock.innerHTML = "";
};

// очистка инпутов
const inputsClear = () => {
  const inputs = document.querySelectorAll(".modal__window__form__input");
  inputs.forEach((input) => (input.value = ""));
  errorBlockClear();
};

// фокус
const inputFocus = () => {
  inputTitle.focus();
};

// закрытие модалки
const closeModal = () => {
  modal.classList.add("close-modal");
  setTimeout(function () {
    modal.classList.remove("modal-active");
    inputsClear();
  }, 500);
};

// открытие модалки
const openModal = () => {
  modal.classList.remove("close-modal");
  modal.classList.add("modal-active");
  inputFocus();
};

// шаблон html (template)
const prevTask = ({ inputTitle, inputDiscription, id, completed }) => {
  const temp = document.querySelector("#template").cloneNode(true);
  const tempContent = temp.content;
  const taskId = (tempContent.querySelector(
    ".main__task__listBlock"
  ).dataset.id = id);
  const labelFor = tempContent
    .querySelector(".main__task__btnBlock__label")
    .setAttribute("for", id);
  const checkboxId = (tempContent.querySelector(
    ".main__task__btnBlock__checkbox"
  ).id = id);
  const checkbox = (tempContent.querySelector(
    ".main__task__btnBlock__checkbox"
  ).checked = completed);
  if (completed) {
    tempContent
      .querySelector(".main__task__taskBlock")
      .classList.add("checked");
  } else {
    tempContent
      .querySelector(".main__task__taskBlock")
      .classList.remove("checked");
  }
  const titleTask = (tempContent.querySelector("#titleTask").textContent =
    inputTitle);
  const discriptionTask = (tempContent.querySelector(
    "#discriptionTask"
  ).textContent = inputDiscription);

  return tempContent;
};

const start = () => {
  activeTab = "all";
  taskActive = getLocalStoragData();
  getTitle(taskActive);
  initLocalStorage();
  initTask();
  form.addEventListener("submit", handleForm);
  inputTitle.addEventListener("input", errorBlockClear);
  btnFilterAllTask.addEventListener("click", handleBtnFilter);
  btnFilterInProcess.addEventListener("click", handleBtnFilter);
  btnFilterDone.addEventListener("click", handleBtnFilter);
  btnShowForm.addEventListener("click", openModal);
  close.addEventListener("click", closeModal);
  btnReset.addEventListener("click", () => {
    errorBlockClear();
    inputFocus();
  });
  document.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
};

start();
