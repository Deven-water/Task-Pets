import { useState } from 'react';

import { blueSky, nightSky } from '../images';

function SettingsPage({username, setUsername, save, background, setBackground, stats, setStats}) {
    const [popUp, setPopUp] = useState("")
    const [input, setInput] = useState(username)

    function changeUsername() {
        setUsername(input)
        save({username:input})
        setPopUp(false)
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <div className = "flex justify-between mb-5 items-center gap-4 bg-gray-800 p-4 rounded">
                <span className='font-bold'>Username:</span>
                <span>{username}</span>
                <button className='ml-auto bg-gray-600 px-3 py-1 rounded hover:bg-gray-500 cursor-pointer'
                onClick={() => setPopUp("username")}>Change</button>
            </div>
            <div className = "flex justify-between mb-5 items-center gap-4 bg-gray-800 p-4 rounded">
                <span className='font-bold'>Background:</span>
                { background ? <img className="w-[50px] h-[50px]" src={background}/> 
                : <p>Dark</p>}
                <button className='ml-auto bg-gray-600 px-3 py-1 rounded hover:bg-gray-500 cursor-pointer'
                onClick={() => setPopUp("bg")}>Change</button>
            </div>
            <div className='flex items-center gap-4 mb-2 bg-gray-800 p-4 rounded'>
                <h1 className='font-bold'>Stats:</h1>
                <div className = "grid grid-cols-1 gap-4">
                    <p>Streak: {stats.streak}</p>
                    <p>Task Completed: {stats.taskCom}</p>
                    <p>Pets Adopted: {stats.adopted}</p>
                </div>
            </div>

            {popUp == "username" && (
                <div>
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setPopUp(false)}>
                        <div className="bg-gray-800 rounded p-6 items-center flex flex-col gap-4 w-[300px] h-[200px] border-2 border-solid"
                        onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center w-full">
                                <h2 className="text-xl font-bold text-center flex-1">Change Username</h2>
                                <button className='ml-auto cursor-pointer hover:bg-gray-900 rounded-full w-[25px] h-[25px]'
                                onClick={() => setPopUp(false)}>❌</button>
                            </div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Your New Username"
                                className="bg-gray-900 px-4 py-2 rounded"
                            />
                            <button className="bg-blue-600 p-2 w-[200px] rounded hover:bg-blue-700 cursor-pointer"
                            onClick={changeUsername}>
                                Save 
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {popUp == "bg" && (
                <div>
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setPopUp(false)}>
                        <div className="bg-gray-800 rounded p-6 items-center flex flex-col gap-4 w-[400px] h-[200px] border-2 border-solid"
                        onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center w-full">
                                <h2 className="text-xl font-bold text-center flex-1">Change Background</h2>
                                <button className='ml-auto cursor-pointer hover:bg-gray-900 rounded-full w-[25px] h-[25px]'
                                onClick={() => setPopUp(false)}>❌</button>
                            </div>
                            
                            <div className="grid w-full grid-cols-2 gap-4">
                                <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => {
                                    setBackground(blueSky);
                                    save({background: blueSky});
                                    }}>Blue Sky</button>
                                <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => {
                                    setBackground(nightSky);
                                    save({background: nightSky});
                                    }}>Night Sky</button>
                                <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => {
                                    setBackground(null);
                                    save({background: null});
                                }}>Dark</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            
        </div>
    );
}

export default SettingsPage;