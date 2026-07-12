import { useState, useEffect, useRef, use } from 'react';
import ShopPage from './pages/ShopPage';
import SettingsPage from './pages/SettingsPage';
import PlaygroundPage from './pages/PlaygroundPage';

import { blueSky } from './images';

function App() {
  const [page, setPage] = useState('todos');
  const [menuOpen, setMenuOpen] = useState(false);
  const [popUp, setPopUp] = useState(false);

  const [todos, setTodos] = useState([]);
  const [coins, setCoins] = useState(0);
  const [exp, setExp] = useState(0);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const [recurring, setRecurring] = useState(false);
  const [recurringTodos, setRecurringTodos] = useState([]);

  const expPerLevel = 100;
  const level = Math.floor(exp / expPerLevel);
  const currentExp = exp % expPerLevel;
  const progress = (currentExp / expPerLevel) * 100;

  const [background, setBackground] = useState(blueSky);
  const [stats, setStats] = useState({streak:0, taskCom:0, adopted:0});
  const [username, setUsername] = useState('user')

  const [inventory, setInventory] = useState({ pets: [], food: [], bg: [] });

  const [displayedText, setDisplayedText] = useState('');

  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = { todos, coins, exp, username, inventory, background, stats, recurringTodos };
  });

  function save(updates = {}) {
    window.electronAPI.save({ ...stateRef.current, ...updates });
  };

  useEffect(() => {
    async function loadData() {
      const data = await window.electronAPI.load();
      setTodos(data.todos || []);
      setCoins(data.coins || 0);
      setExp(data.exp || 0);
      setUsername(data.username || "User");
      setBackground(data.background || blueSky)
      setStats(data.stats || { streak: 0, taskCom: 0, adopted: 0 })
      setRecurringTodos(data.recurringTodos || []);
      
      let inventory = data.inventory || { pets: [], food: [], bg: [] };
      if (data.lastOnline) {
        const minutesPassed = Math.floor((Date.now() - data.lastOnline) / 60000);
        if (minutesPassed > 0) {
          inventory = {
            ...inventory,
            pets: inventory.pets.map(pet => ({
              ...pet,
              hunger: Math.max(0, pet.hunger - minutesPassed),
              happiness: Math.max(0, pet.happiness - minutesPassed),
            }))
          };
        }

        const savedStats = data.stats || { streak: 0, taskCom: 0, adopted: 0 };
        if (minutesPassed >= 1440 && minutesPassed <= 2880) {
          const newStats = { ...savedStats, streak: savedStats.streak + 1 };
          setStats(newStats);
          window.electronAPI.save({ ...data, stats: newStats, inventory });
        } else if (minutesPassed > 2880) {
          const newStats = { ...savedStats, streak: 0 };
          setStats(newStats);
          window.electronAPI.save({ ...data, stats: newStats, inventory });
        } else {
          setStats(savedStats);
        }
      }
      setInventory(inventory);
    }
    loadData();

    const interval = setInterval(() => {
      setInventory(prev => {
        const newInventory = {
          ...prev,
          pets: prev.pets.map(pet => ({
            ...pet,
            hunger: Math.max(0, pet.hunger - (Math.floor(Math.random() * 10) + 1)),
            happiness: Math.max(0, pet.happiness - (Math.floor(Math.random() * 10) + 1)),
          }))
        };
        
        save({inventory: newInventory});

        return newInventory;
      });

      const now = new Date();
      stateRef.current.todos.forEach(todo => {
        if (!todo.date) return;
        const due = new Date(`${todo.date}T${todo.time || '23:59'}`);
        if (due < now) {
          window.electronAPI.notify({ title: 'Task Overdue', body: `"${todo.name}" is past due!` });
        }
      });
    }, 60000);

    window.electronAPI.onTaskCompleted((index) => {
      setTodos(prev => prev.filter((_, i) => i !== index));
      setCoins(prev => prev + 100);
      setExp(prev => prev + 25);
      setStats(prev => ({ ...prev, taskCom: (prev.taskCom || 0) + 1 }));
    });

    window.electron.ipcRenderer.on('daily-task', () => {
      setTodos([...new Set([...todos, ...recurringTodos])])
    });
    
    return () => {
      window.electron.ipcRenderer.removeAllListeners('daily-task');
      return clearInterval(interval);}
  }, []);

  function addTask() {
    if (name) {
      const newTodos = [...todos, { name, date, time }];
      setTodos(newTodos);
      save({todos:newTodos});

      if (recurring) {
        setRecurringTodos(newTodos);
        save({recurringTodos:newTodos});
        setRecurring(false);
      };

      setName('');
      setDate('');
      setTime('');
      setPopUp(false)
    };
  }

  function completeTask(index) {
    const newTodos = todos.filter((_, i) => i !== index);
    const newCoins = coins + 10;
    const newExp = exp + 25;
    const newTaskCom = stats.taskCom + 1;
    setCoins(newCoins);
    setExp(newExp);
    setTodos(newTodos);
    setStats(prev => ({ ...prev, taskCom: newTaskCom }));
    save({ todos: newTodos, coins: newCoins, exp: newExp, stats: { ...stats, taskCom: newTaskCom } });
  }

  function convertTime(time) {
    if (!time) return "";

    const [hourSt, min] = time.split(":");
    const hour = +hourSt;
    
    if (hour >= 12) {
      return `${hour % 12 || 12}:${min} PM`
    }
    else {
      return `${hour || 12}:${min} AM`
    };
  }

  function convertDate(date) {
    if (!date) return "";

    const [year, month, day] = date.split("-");
    
    return `${month}/${day}/${year}`
  }

  useEffect(() => {
    const fullText = `Welcome ${username}, let's get some work done today!`;
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [username]);

  return (
    <div className="min-h-screen text-white p-8 text-shadow-lg/30 bg-black" style={{ backgroundImage: `url(${background})` }}>
      <div className="relative flex justify-between items-center mb-6">
        <span className="text-3xl font-bold">Task Pets</span>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-3xl">
            ☰
          </button>

      {menuOpen && (
        <div className="absolute right-0 top-full bg-black rounded p-4 flex flex-col border-2 border-solid z-10">
          <button
            onClick={() => { setPage('todos'); setMenuOpen(false); }}
            className="text-left px-4 py-2 rounded hover:bg-gray-700">
            Todos
          </button>

          <button
            onClick={() => { setPage('Shop'); setMenuOpen(false); }}
            className="text-left px-4 py-2 rounded hover:bg-gray-700">
            Shop
          </button>

          <button
            onClick={() => { setPage('Settings'); setMenuOpen(false); }}
            className="text-left px-4 py-2 rounded hover:bg-gray-700">
            Settings
          </button>

          <button
            onClick={() => { setPage('Playground'); setMenuOpen(false); }}
            className="text-left px-4 py-2 rounded hover:bg-gray-700">
            Playground
          </button>
        </div>
      )}
      </div>

      {page === 'todos' && (
        <div>
          <h1 className='text-xl font-bold italic mb-6 tracking-widest'>
            {displayedText}<span className="animate-pulse">|</span>
          </h1>
          
          <div className="mb-6 text-xl text-yellow-400">Coins: ${coins}</div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-xl font-bold">Level {level}</span>
              <span className="text-gray-200">{currentExp} / {expPerLevel} EXP</span>
            </div>
            <div className="flex justify-between w-full bg-gray-800 rounded-full h-5">
              <div
                className="bg-green-500 h-5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <button onClick={() => setPopUp(true)} className="absolute bottom-6 right-4 bg-gray-800 w-14 h-14 rounded-full z-10 text-5xl flex items-center justify-center hover:bg-gray-900">
              +
          </button>

          {todos.map((todo, index) => (
            <div key={index} className="flex items-center gap-4 mb-2 bg-gray-800 p-4 rounded">
              <span>{todo.name}</span>
              <span className="text-gray-400">{convertDate(todo.date)}</span>
              <span className="text-gray-400">{convertTime(todo.time)}</span>
              <button
                onClick={() => completeTask(index)}
                className="ml-auto bg-green-600 px-3 py-1 rounded hover:bg-green-700"
              >
                Complete
              </button>
            </div>
          ))}
        </div>
      )}

      {popUp && (
        <div>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setPopUp(false)}>
            <div className="bg-gray-800 rounded p-6 items-center flex flex-col gap-4 w-[700px] h-[200px] border-2 border-solid"
              onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-center flex-1">Add a Task!</h2>
            <button className='ml-auto cursor-pointer hover:bg-gray-900 rounded-full w-[25px] h-[25px]'
              onClick={() => setPopUp(false)}>❌</button>
            </div>
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Task Name"
                    className="bg-gray-900 px-4 py-2 rounded"
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-gray-900 px-4 py-2 rounded"
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-gray-900 px-4 py-2 rounded"
                  />
                  <button
                    onClick={addTask}
                    className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                      Add
                  </button>
                </div>
                  <div className="flex gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <input 
                        type="checkbox" 
                        checked={recurring}
                        onChange={(e) => setRecurring(e.target.checked)}
                        />
                      <div>Recurring Task</div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
      )}

      {page === "Shop" && (
        <ShopPage 
          coins={coins}
          setCoins={setCoins}
          save={save}
          inventory={inventory}
          setInventory={setInventory}
          stats={stats}
          setStats={setStats}
        />)}

      {page === "Settings" && (
        <SettingsPage
          username={username}
          setUsername={setUsername}
          save={save}
          background={background}
          setBackground={setBackground}
          stats={stats}
          setStats={setStats}
      />)}

      {page === "Playground" && (
        <PlaygroundPage
          save={save}
          inventory={inventory}
          setInventory={setInventory}
      />)}
    </div>
  );
}

export default App;