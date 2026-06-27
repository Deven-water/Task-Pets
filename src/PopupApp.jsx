import { useState, useEffect } from 'react';

function PopupApp() {
    const [todos, setTodos] = useState([]);
    
    useEffect(() => {
        async function loadData() {
            const data = await window.electronAPI.load();
            setTodos(data.todos || []);
        }
        loadData();
    }, []);

    return (
        <div className="bg-gray-900 text-white p-4 h-screen flex flex-col gap-3">
            <h1 className="text-lg font-bold">Task Pets</h1>

            <div>
                <p className="text-xs text-gray-400 mb-1">Tasks ({todos.length})</p>
                {todos.map((todo, index) => (
                    <div key={index} className="flex items-center gap-4 mb-2 bg-gray-800 p-4 rounded">
                        <span>{todo.name}</span>
                        <span className="text-gray-400">{todo.date}</span>
                        <span className="text-gray-400">{todo.time}</span>
                        <button
                            onClick={() => {
                                window.electronAPI.completeTask(index);
                                setTodos(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="ml-auto bg-green-600 px-3 py-1 rounded hover:bg-green-700">
                            Complete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PopupApp;
