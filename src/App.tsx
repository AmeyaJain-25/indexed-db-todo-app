import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { AutoSizer, List } from 'react-virtualized';
import './app.css';
import { ITodoItem } from './App.type';
import {
  addData,
  addMultipleData,
  deleteAllData,
  getStoreData,
  initDB,
  Stores,
  updateData,
} from './db';

function App() {
  const [isLoadingMultipleAdd, setIsLoadingMultipleAdd] =
    useState<boolean>(false);
  const [isLoadingTodos, setIsLoadingTodos] = useState<boolean>(false);
  const [isLoadingReset, setIsLoadingReset] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [todoInp, setTodoInp] = useState<string>('');
  const [todoIds, updateTodoIds] = useState<string[]>([]);
  const [todosById, updateTodosById] = useState<{
    [todoId: string]: ITodoItem;
  }>({});

  const handleAddNewTodo = async () => {
    if (!todoInp) {
      setErrorMsg('Please add some todo');
      return;
    }
    const newTodoId = nanoid();
    const newTodo: ITodoItem = {
      id: newTodoId,
      todo: todoInp,
      isCompleted: false,
      createdAt: new Date().getTime(),
    };

    try {
      const result = await addData(Stores.Todos, newTodo);
      if (result) {
        updateTodoIds((prev) => [...prev, newTodoId]);
        updateTodosById((prev) => ({
          ...prev,
          [newTodoId]: newTodo,
        }));
        setTodoInp('');
        setErrorMsg('');
      }
    } catch (err: unknown) {
      let errorMessage = '';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Something went wrong';
      }

      setErrorMsg(errorMessage);
    }
  };

  const handleMarkTodoAsCompleted = async (todoItem: ITodoItem) => {
    const updatedTodoItem = { ...todoItem, isCompleted: !todoItem.isCompleted };

    try {
      const result = await updateData(Stores.Todos, updatedTodoItem);
      if (result) {
        updateTodosById((prev) => {
          return {
            ...prev,
            [todoItem.id]: updatedTodoItem,
          };
        });
        setErrorMsg('');
      }
    } catch (err: unknown) {
      let errorMessage = '';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Something went wrong';
      }

      setErrorMsg(errorMessage);
    }
  };

  const handleAddRandomTodos = async () => {
    setIsLoadingMultipleAdd(true);
    const randomTodos: ITodoItem[] = [];
    const createdAtList: number[] = [];
    const randomTodoIds: string[] = [];

    for (let i = 0; i < 1000; i++) {
      createdAtList.push(new Date().getTime() + Math.random() * 1000000);
    }

    createdAtList.sort((a, b) => a - b);

    const randomTodosById: { [todoId: string]: ITodoItem } = {};
    createdAtList.forEach((createdAt, idx) => {
      const todoId = nanoid();
      const todoItem = {
        id: todoId,
        todo: 'Todo ' + (todoIds.length + idx),
        isCompleted: false,
        createdAt: createdAt,
      };
      randomTodoIds.push(todoId);
      randomTodosById[todoId] = todoItem;
      randomTodos.push(todoItem);
    });

    try {
      const data = await addMultipleData(Stores.Todos, randomTodos);
      if (data?.length) {
        updateTodoIds((prev) => [...prev, ...randomTodoIds]);
        updateTodosById((prev) => ({ ...prev, ...randomTodosById }));
        setErrorMsg('');
      }
    } catch (err: unknown) {
      let errorMessage = '';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Something went wrong';
      }

      setErrorMsg(errorMessage);
    }
    setIsLoadingMultipleAdd(false);
  };

  const handleReset = async () => {
    setIsLoadingReset(true);
    try {
      const result = await deleteAllData(Stores.Todos);
      if (result) {
        updateTodoIds([]);
        updateTodosById({});
        setErrorMsg('');
      }
    } catch (err: unknown) {
      let errorMessage = '';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Something went wrong';
      }

      setErrorMsg(errorMessage);
    }
    setIsLoadingReset(false);
  };

  const initializeDB = async () => {
    try {
      await initDB();
    } catch (error) {}
  };

  const getTodos = async () => {
    setIsLoadingTodos(true);
    const todos = await getStoreData<ITodoItem>(Stores.Todos);

    const todosById: { [todoId: string]: ITodoItem } = {};
    const todoIds: string[] = [];

    todos.forEach((todo) => {
      todosById[todo.id] = todo;
      todoIds.push(todo.id);
    });

    updateTodoIds(todoIds);
    updateTodosById(todosById);
    setIsLoadingTodos(false);
  };

  useEffect(() => {
    initializeDB();

    setTimeout(() => {
      getTodos();
    }, 2000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="root">
      <textarea
        value={todoInp}
        onChange={(e) => setTodoInp(e.target.value)}
        placeholder="Please add a note..."
        rows={6}
      />
      {!isLoadingTodos ? (
        <div className="action_btns_wrapper">
          <button disabled={isLoadingReset} onClick={handleReset}>
            Reset
          </button>
          <button
            disabled={isLoadingMultipleAdd}
            onClick={handleAddRandomTodos}
          >
            {isLoadingMultipleAdd ? 'Adding...' : '+ 1000 random'}
          </button>
          <button onClick={handleAddNewTodo}>Add</button>
        </div>
      ) : null}
      {errorMsg ? <p style={{ color: 'red' }}>{errorMsg}</p> : null}
      <div className="content">
        {isLoadingTodos ? (
          <p>Please wait... Loading todos!</p>
        ) : (
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                height={400}
                className="todo_list"
                rowCount={todoIds.length}
                rowHeight={50}
                rowRenderer={({ index, key, style }) => {
                  const {
                    id: todoId,
                    isCompleted,
                    todo,
                  } = todosById[todoIds[index]];
                  return (
                    <div className="todo_item" key={key} style={style}>
                      <label className="checkbox_label">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() =>
                            handleMarkTodoAsCompleted(todosById[todoId])
                          }
                        />
                        <div className="checkbox_checkmark"></div>
                        <div className="checkbox_body">{todo}</div>
                      </label>
                    </div>
                  );
                }}
                width={width}
              />
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  );
}

export default App;

//  todoIds.map((todoId) => {
//           const todo = todosById[todoId];

//           return (
//             <div className="todo_item" key={todoId}>
//               <label className="checkbox_label">
//                 <input
//                   type="checkbox"
//                   checked={todo.isCompleted}
//                   onChange={() => handleMarkTodoAsCompleted(todo)}
//                 />
//                 <div className="checkbox_checkmark"></div>
//                 <div className="checkbox_body">{todo.todo}</div>
//               </label>
//             </div>
//           );
//         })
