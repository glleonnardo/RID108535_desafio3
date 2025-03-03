
const setTasksInLocalStorage = (tasks) => {
    tasks = tasks.filter(task => task.Name.length > 1)
    window.localStorage.setItem('tasks', JSON.stringify(tasks));
}

const getTasksFromLocalStorage = () => {
    const updatedTasks = JSON.parse(window.localStorage.getItem('tasks'));
    return updatedTasks ? updatedTasks : [];
}

const countTasks = (tasks) => {
    let counterTasksDom;
    const counterTasks = document.getElementById('counterTasks');

    if (counterTasks) counterTasksDom = counterTasks;
    else {
        const counterTasks = document.createElement('div');
        counterTasks.id = 'counterTasks';
        document.getElementById('counterTasks').appendChild(counterTasks);
        counterTasksDom = counterTasks;
    }
    const completed = tasks.filter(({ checked }) => checked).length;
    const allTasks = tasks.length;
    counterTasksDom.textContent = `${completed}/${allTasks} concluídas`;
}

const createItemList = (tasks, checkbox) => {
    const lista = document.getElementById('taskList');
    const taskItem = document.createElement('li');
    const id = tasks.id
    taskItem.id = id;
    taskItem.appendChild(checkbox);
    lista.appendChild(taskItem)
    return taskItem;
}

const renderTaskList = () => {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks = getTasksFromLocalStorage();

    tasks.forEach((task) => {
        const data = getCheckBoxAndTask(task);
        const itemList = createItemList(task, data);

        if (task.checked) {
            itemList.classList.add('ok')
        } else {
            itemList.classList.remove('ok')
        }

    })
    countTasks(tasks)
    showEmptyMessage()
}

const finishDoneTasks = () => {
    tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.filter(({ checked }) => !checked);

    setTasksInLocalStorage(updatedTasks)
    renderTaskList();
}

const showEmptyMessage = () => {
    const list = document.getElementById('taskList');
    tasks = getTasksFromLocalStorage();
    let emptyMessage = document.getElementById('emptyMessage');

    if (!emptyMessage) {
        emptyMessage = document.createElement('p');
        emptyMessage.id = 'emptyMessage';
        emptyMessage.textContent = 'Nenhuma tarefa cadastrada';
    }

    if (tasks.length === 0) {
        if (!list.contains(emptyMessage)) {
            list.appendChild(emptyMessage)
        }
    } else {
        if (emptyMessage.parentNode) {
            emptyMessage.remove();
        }
    }
}

const newTaskId = () => {
    const lastId = tasks[tasks.length - 1]?.id;
    return lastId ? lastId + 1 : 1;
}

const creationTask = () => {
    const dataClick = new Date();
    const formatoBR = dataClick.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return formatoBR;
}

const onCheckboxClick = (event) => {
    const id = parseInt(event.target.id.split('-')[0]);
    const isChecked = event.target.checked

    tasks = getTasksFromLocalStorage()
    const updatedTasks = tasks.map((task) => task.id === id ? { ...task, checked: isChecked } : task);
    setTasksInLocalStorage(updatedTasks);
    renderTaskList()
}

getCheckBoxAndTask = ({ id, Name, sticker, creationDate, checked }) => {
    const taskTitle = document.createElement('p');
    const tag = document.createElement('p');
    const taskDate = document.createElement('p');
    const finishTask = document.createElement('input');
    const label = document.createElement('label');
    const taskInfoContainer = document.createElement('span');
    const buttonContainer = document.createElement('span');
    const wraper = document.createElement('div');
    const span = document.createElement('span');
    const icone = document.createElement('i');

    finishTask.type = 'checkbox';
    finishTask.id = `${id}-checkbox`;
    finishTask.className = 'hidden';
    finishTask.checked = checked;
    finishTask.addEventListener('change', onCheckboxClick)

    icone.classList = 'fas fa-check'
    label.classList = 'notYet';
    span.textContent = 'Concluir';
    label.htmlFor = finishTask.id;
    label.id = finishTask.id
    wraper.className = 'taskItemContainer';
    taskTitle.className = 'taskTitle';
    taskInfoContainer.className = 'taskDetailContainer';
    buttonContainer.className = 'buttonTask';
    tag.className = 'tag';
    taskDate.className = 'dataTask'
    label.appendChild(icone);
    label.appendChild(span)

    taskTitle.textContent = Name;
    tag.textContent = sticker;
    taskDate.textContent = creationDate;
    taskInfoContainer.appendChild(taskTitle);
    taskInfoContainer.appendChild(tag);
    taskInfoContainer.appendChild(taskDate);
    buttonContainer.appendChild(finishTask)
    buttonContainer.appendChild(label);
    wraper.appendChild(taskInfoContainer);
    wraper.appendChild(buttonContainer);

    return wraper;
}

const createTaskPromise = (event) => new Promise((resolve) => {
    setTimeout(() => {
        resolve(getTaskData(event))
    }, 2000);
})

const getTaskData = (event) => {
    const id = newTaskId()
    const Name = event.target.elements.taskName.value;
    const sticker = event.target.elements.sticker.value
    const creationDate = 'criado em: ' + creationTask();
    return { id, Name, sticker, creationDate, checked: false }
}

const addTask = async (event) => {
    tasks = getTasksFromLocalStorage();
    event.preventDefault();
    const input = document.getElementById('taskName');
    input.addEventListener('blur', () => {
        if (input.value.trim().length > 0) {
            input.classList.remove('required');
        }
    })
    if (event.target.elements.taskName.value.length > 1) {
        document.getElementById('sendTask').setAttribute('disabled', true);
        const taskData = await createTaskPromise(event);
        const checkbox = getCheckBoxAndTask(taskData);
        const updatedTasks = [...tasks, taskData]
        createItemList(taskData, checkbox)
        setTasksInLocalStorage(updatedTasks);
        event.target.elements.taskName.classList.remove('required');
        event.target.elements.taskName.value = '';
        event.target.elements.sticker.value = '';
        document.getElementById('sendTask').removeAttribute('disabled');
        countTasks(updatedTasks);
    } else {
        event.target.elements.taskName.classList.add('required');
    }
    
    
    showEmptyMessage();

}

window.onload = () => {
    const taskForm = document.getElementById('formTask');
    taskForm.addEventListener('submit', addTask)
    tasks = getTasksFromLocalStorage();
    renderTaskList();
    showEmptyMessage()
}