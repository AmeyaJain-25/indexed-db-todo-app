import { useState } from 'react';
import { nanoid } from 'nanoid';
import { List } from 'react-virtualized';
import useLocalStorage from './hooks/useLocalStorage';
import './app.css';
import { ITodoItem } from './App.type';

function App() {
  const [todoInp, setTodoInp] = useState<string>('');
  const [todoIds, updateTodoIds] = useLocalStorage<string[]>('todo_ids', []);
  const [todosById, updateTodosById] = useLocalStorage<{
    [todoId: string]: ITodoItem;
  }>('todos_by_id', {});

  const handleAddNewTodo = () => {
    const newTodoId = nanoid();
    const newTodo: ITodoItem = {
      id: newTodoId,
      todo: todoInp,
      isCompleted: false,
    };

    updateTodoIds((prev) => [...prev, newTodoId]);
    updateTodosById((prev) => ({
      ...prev,
      [newTodoId]: newTodo,
    }));
    setTodoInp('');
  };

  const handleMarkTodoAsCompleted = (todoId: string) => {
    updateTodosById((prev) => {
      const todoToBeUpdated = prev[todoId];
      todoToBeUpdated.isCompleted = !todoToBeUpdated.isCompleted;
      return {
        ...prev,
        [todoId]: todoToBeUpdated,
      };
    });
  };

  const handleAddRandomTodos = () => {
    const todoIds: string[] = [];
    for (var i = 0; i < 1000; i++) {
      todoIds.push(i + nanoid());
    }

    const todosById: { [todoId: string]: ITodoItem } = {};
    todoIds.forEach((todoId) => {
      todosById[todoId] = {
        id: todoId,
        todo: 'Hello' + todoId,
        isCompleted: false,
      };
    });

    updateTodoIds((prev) => [...prev, ...todoIds]);
    updateTodosById((prev) => ({ ...prev, ...todosById }));
  };

  const handleReset = () => {
    updateTodoIds([]);
    updateTodosById({});
  };

  return (
    <div className="root">
      <textarea
        value={todoInp}
        onChange={(e) => setTodoInp(e.target.value)}
        placeholder="Please add a note..."
        rows={6}
      />
      <button onClick={handleAddNewTodo}>Add</button>
      <button onClick={handleReset}>Reset</button>
      <button onClick={handleAddRandomTodos}>
        Add thousands of random todos
      </button>
      <div className="content">
        {todoIds.map((todoId) => {
          const { id, todo, isCompleted } = todosById[todoId];
          return (
            <div key={todoId} className="todo_item">
              <input
                checked={isCompleted}
                onChange={() => handleMarkTodoAsCompleted(todoId)}
                type="checkbox"
              />
              <p>{id}</p>
              <p>{todo}</p>
              <p>{isCompleted ? 'Yes' : 'No'}</p>
            </div>
          );
        })}
        {/* <List
          height={400}
          rowCount={todoIds.length}
          rowHeight={60}
          rowRenderer={({ index, key, style }) => (
            <div className="todo_item" key={key} style={style}>
              {todosById[todoIds[index]].id} <br />
              {todosById[todoIds[index]].todo} <br />
              {todosById[todoIds[index]].isCompleted ? 'Yes' : 'No'}
            </div>
          )}
          width={300}
        /> */}
      </div>
    </div>
  );
}

export default App;
