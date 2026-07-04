import { useState, useEffect, useRef } from 'react';
import { grassBg } from '../images';

function PlaygroundPage({ inventory, setInventory, save }) {
    const [mode, setMode] = useState("wander");
    const SPEED = 2;

    const imgRef = useRef(null);
    const animation = useRef(null);

    const position = useRef({x:100, y:100});
    const target = useRef({x:100, y:100});

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [petinfo, setPetinfo] = useState(null);
    const [interact, setInteract] = useState(null);

    const [petName, setPetName] = useState("");
    const [petBackground, setPetBackground] = useState(null);
    
    const [hunger, setHunger] = useState(null);
    const [happiness, setHappiness] = useState(null);

    function newTarget() {
        if (mode === "wander") {
            if (!imgRef.current) return;
            
                const imgWidth = imgRef.current.offsetWidth || 100;
                const imglength = imgRef.current.offsetHeight || 100;

                const maxX = window.innerWidth - imgWidth;
                const maxY = window.innerHeight - imglength;

                target.current = {
                    x: (imgWidth / 2) + Math.random() * maxX,
                    y: (imglength / 2) + Math.random() * maxY,
                };
            };
        };

    function followMouse(e) {
        if (mode == "follow") {
            target.current = { x: e.clientX, y: e.clientY };
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        };
    
    function moveAnimation() {
        const distanceX = target.current.x - position.current.x;
        const distanceY = target.current.y - position.current.y;
        const distance = Math.sqrt(distanceX**2 + distanceY**2)


        if (distance <= 1) {
            position.current.x = target.current.x;
            position.current.y = target.current.y;
            newTarget();
        } else {
            position.current.x += (distanceX / distance) * SPEED;
            position.current.y += (distanceY / distance) * SPEED;
        };

        if (imgRef.current) {
            const { x, y } = position.current;
            const halfW = imgRef.current.offsetWidth / 2;
            const halfH = imgRef.current.offsetHeight / 2;
            imgRef.current.style.transform = `translate3d(${x - halfW}px, ${y - halfH}px, 0)`;
        ;}   

        animation.current = requestAnimationFrame(moveAnimation);
    };

    function changeMode() {
        setMode(m => m === "wander" ? "follow" : "wander");
    };

    const happinessInterval = useRef(null);

    function increaseHappiness(petIndex) {
        happinessInterval.current = setInterval(() => {
            setHappiness(prev => Math.min(100, prev + 1));
            setInventory(prev => {
                const newInventory = {
                    ...prev,
                    pets: prev.pets.map((pet, pi) => pi === petIndex
                        ? { ...pet, happiness: Math.min(100, pet.happiness + 1) }
                        : pet
                    )
                };
                save({ inventory: newInventory });
                return newInventory;
            });
        }, 1000);
    };

    function stopIncreaseHappiness() {
        clearInterval(happinessInterval.current);
        happinessInterval.current = null;
    };

    useEffect(() => {
        newTarget();
        window.addEventListener('mousemove', followMouse);
        animation.current = requestAnimationFrame(moveAnimation);

        return () => {
            window.removeEventListener('mousemove', followMouse);
            if (animation.current) {
                cancelAnimationFrame(animation.current);
            }
        };
    }, [mode, interact]);



    return (
        <div>
        <div className="grid grid-cols-3 gap-4">
                {inventory.pets.length === 0 ? <p className='bg-gray-800 rounded text-xl font-bold p-8 text-shadow-lg/30'>You currently don't have any pets. Go to the shop to adopt one!</p>: inventory.pets.map((item,index) => (
                    <div key={index}>
                    <button onClick={() => setPetinfo(index)} className='relative hover:bg-black/30 rounded-full'>
                        <img className='w-100 h-80 object-contain' src={item.house}></img>
                        <div className="absolute inset-0 flex items-center top-14">
                            <img className='w-100 h-40 object-contain' src={item.pic}></img>
                        </div>
                        <div className='absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 px-2 py-0.5 rounded text-white text-md whitespace-nowrap'>"{item.name}"</div>
                        </button>

                        {petinfo == index && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPetinfo(null)}>
                                <div className="bg-gray-800 rounded p-6 items-center flex flex-col gap-4 w-[700px] h-[500px] border-2 border-solid relative" onClick={(e) => e.stopPropagation()}>
                                    <button className='absolute top-3 right-3 cursor-pointer rounded-full w-[25px] h-[25px] hover:bg-gray-900' onClick={() => setPetinfo(null)}>❌</button>
                                    <div>
                                         <div className='w-[500px] p-10'>
                                            <h2 className="text-xl font-bold text-center">"{item.name}"
                                            </h2>
                                            <img className='w-100 h-60 object-contain' alt="Fixed size" src={item.pic} />
                                        </div>
                                        <div className='flex gap-2 mt-1'>
                                            <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => {
                                                setInteract("play");
                                                setHappiness(item.happiness);
                                                increaseHappiness(index);
                                            }}>Play</button>
                                            <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => {setInteract("decorate"), setPetName(item.name), setPetBackground(item.house)}}>Decorate</button>
                                            <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => {setInteract("feed"), setHunger(item.hunger)}}>Feed</button>
                                            <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => setInteract("release")}>Release</button>
                                        </div>
                                        <p className='flex bg-gray-900 rounded p-3 mt-4 font-bold'>{
                                            item.hunger <= 20 && item.happiness <= 20 ? `${item.name} is starving and miserable!` :
                                            item.hunger <= 20 ? `${item.name} is starving!` :
                                            item.happiness <= 20 ? `${item.name} is very sad!` :
                                            item.happiness >= 80 && item.hunger >= 80 ? `${item.name} is thriving!` :
                                            item.happiness >= 80 && item.hunger < 80 ? `${item.name} is happy but hungry!` :
                                            item.happiness < 80 && item.hunger >= 80 ? `${item.name} is bored but well fed!` :
                                            `${item.name} is bored and hungry!`
                                        }</p>
                                    </div>
                                    </div>
                                </div>
                    )}

                    {interact == "play" && petinfo == index && (
                        <div className="fixed inset-0 w-full h-full z-[60]" style={{ backgroundImage: `url(${grassBg})`, cursor: mode === "follow" ? "none" : "default" }}>
                        <h1 className='text-center text-xl font-bold p-8'>{item.name} is running around in the grass!</h1>

                        <button onClick={changeMode} className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-5 rounded z-10 hover:bg-gray-900">
                            {mode === "wander" ? "Click to Follow!" : "Click to Roam!"}
                        </button>

                        <button onClick={() => {
                            stopIncreaseHappiness();
                            setInteract(null);
                        }} className="absolute top-6 right-4 bg-gray-800 px-3 py-1 rounded z-10 hover:bg-gray-900">
                            ❌
                        </button>

                        {mode === "follow" && (
                            <div style={{ position: "fixed", left: mousePos.x, top: mousePos.y, transform: "translate(-50%, -50%)", fontSize: "2rem", pointerEvents: "none", zIndex: 70 }}>
                                🦴
                            </div>
                        )}

                        <img ref={imgRef} src={item.pic}
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "150px",
                                height: "150px",
                                willChange: "transform",
                                pointerEvents: "none",
                            }}/>

                        <div className="w-100 fixed bottom-0 left-1/2 -translate-x-1/2 mb-4">
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span className='bg-gray-900 rounded p-1 text-sm font-medium'>Happiness</span>
                                <span className='bg-gray-900 rounded p-1'>{happiness}/100</span>
                            </div>
                            <div className="bg-gray-900 rounded-full h-3">
                                <div className="h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${happiness}%`, backgroundColor: happiness >= 80 ? '#22c55e' : happiness >= 40 ? '#eab308' : '#ef4444' }}/>
                            </div>
                        </div>
                        </div>
                    )}

                        {interact == "decorate" && petinfo == index && (
                            <div className="fixed inset-0 flex items-center justify-center z-[60]">
                            <div className="bg-gray-800 rounded p-6 flex flex-col gap-4 w-[700px] h-[500px] border-2 border-solid relative">
                            <button className='absolute top-3 right-3 bg-green-700 hover:bg-green-800 cursor-pointer rounded px-3 py-1 text-white' onClick={() => {
                                const newPets = inventory.pets.map((p, i) => i === index ? { ...p, name: petName, house: petBackground ?? p.house } : p);
                                const newInventory = { ...inventory, pets: newPets };
                                setInventory(newInventory);
                                save({ inventory: newInventory });
                                setInteract(null);
                            }}>
                                Save
                            </button>

                            <div className="flex flex-col items-center gap-4 flex-1 justify-center">
                                <input
                                    type="text"
                                    value={petName}
                                    onChange={(e) => setPetName(e.target.value)}
                                    placeholder="Give a new name!"
                                    className="bg-gray-900 px-4 py-2 rounded text-white text-center"
                                />
                                <img className="w-48 h-48 mt-10" src={petBackground} />
                            </div>
                            <div className="bg-gray-900 rounded p-3">
                                <div className="flex gap-4 overflow-x-auto pb-1">
                                    {inventory.bg.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No backgrounds bought yet.</p>
                                    ) : inventory.bg.map((background, index) => (
                                        <div key={index} className="flex-shrink-0 flex flex-col items-center gap-1 ">
                                            <img src={background.pic} className="w-24 h-16 object-cover rounded border-2 border-gray-600 hover:border-white cursor-pointer" onClick={() => {setPetBackground(background.pic)}}/>
                                            <span className="text-xs text-gray-300">{background.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </div>
                        </div>
                    )}

                    {interact == "feed" && petinfo == index && (
                            <div className="fixed inset-0 flex items-center justify-center z-[60]">
                            <div className="bg-gray-800 rounded p-6 flex flex-col gap-4 w-[700px] h-[500px] border-2 border-solid relative overflow-hidden">
                            <button className='absolute top-3 right-3 bg-gray-900 hover:bg-gray-950 cursor-pointer rounded px-3 py-1 text-white' onClick={() => setInteract(null)}>
                                Done
                            </button>

                            <div className="flex flex-col items-center flex-1 justify-center">
                                <p className="text-white text-center text-xl font-bold mb-2">"{item.name}"</p>
                                <div className="relative flex flex-col items-center">
                                    <img className="w-100 h-60 object-contain" src={item.pic} />
                                </div>
                            </div>

                            <div className="w-full px-1 mb-2">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Hunger</span>
                                    <span>{hunger}/100</span>
                                </div>
                                <div className="w-full bg-gray-900 rounded-full h-3">
                                    <div className="h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${hunger}%`, backgroundColor: hunger >= 80 ? '#22c55e' : hunger >= 40 ? '#eab308' : '#ef4444' }}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded p-3">
                                <div className="flex gap-4 overflow-x-auto pb-1">
                                    {inventory.food.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No food available.</p>
                                    ) : inventory.food.map((food, i) => (
                                        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-700 rounded p-2" onClick={() => {
                                            const newHunger = Math.min(100, (hunger ?? 50) + 10);
                                            setHunger(newHunger);
                                            const newFood = food.amount <= 1
                                                ? inventory.food.filter((_, fi) => fi !== i)
                                                : inventory.food.map((f, fi) => fi === i ? { ...f, amount: f.amount - 1 } : f);
                                            const newPets = inventory.pets.map((p, pi) =>
                                                pi === index ? { ...p, hunger: newHunger } : p
                                            );
                                            const newInventory = { ...inventory, food: newFood, pets: newPets };
                                            setInventory(newInventory);
                                            save({ inventory: newInventory });
                                        }}>
                                            <img src={food.pic} className="w-10 h-10 object-contain" />
                                            <span className="text-xs text-gray-300">{food.name}</span>
                                            <span className="text-xs text-gray-500">x{food.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </div>
                        </div>
                    )}

                    {interact == "release" && petinfo == index && (
                            <div>
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setInteract(null)}>
                        <div className="bg-gray-800 rounded p-6 items-center flex flex-col gap-4 w-[300px] h-[225px] border-2 border-solid"
                        onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center w-full">
                                <h2 className="text-xl text-center flex-1">Are you sure you want to DELETE "{item.name}"?</h2>
                            </div>
                            
                            <button className="bg-green-600 p-2 w-[200px] rounded hover:bg-green-700 cursor-pointer" onClick={ () => {
                                const newPets = inventory.pets.filter((_, i) => i !== index)
                                const newInventory = { ...inventory, pets: newPets };
                                setInventory(newInventory);
                                save({ inventory: newInventory });
                                setInteract(null);
                                setPetinfo(null);
                            }}>
                                YES 
                            </button>
                            <button className="bg-red-600 p-2 w-[200px] rounded hover:bg-red-700 cursor-pointer" onClick={() => setInteract(null)}>
                                NO 
                            </button>
                        </div>
                    </div>
                </div>
                    )}
                    </div>
                ))}
            </div>
            </div>
    );
}

export default PlaygroundPage;