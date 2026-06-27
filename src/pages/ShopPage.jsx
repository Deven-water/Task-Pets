import { useState } from 'react';
import { dogImg, dogHouse, grassBg, food } from '../images';

function ShopPage({coins, setCoins, save, inventory, setInventory, stats, setStats}) {
    const [notAfford, setNotAfford] = useState(null);
    const [bought, setBought] = useState(null);
    const [shopFilter, setShopFilter] = useState("pets");

    const shopItems = [
        {name: "Grass", price: 60, icon: grassBg, type: "bg"},
        {name: "Dog House", price: 60, icon: dogHouse, type: "bg"},
        {name: "Dog", price: 100, icon: dogImg, type: "pets"},
        {name: "super Food", price: 5, icon: food, type: "food"},
    ];

    const filteredItems = shopItems.filter(item => item.type == shopFilter);

    function buyItem(item, index) {
        if (coins >= item.price) {
            const newCoins = coins - item.price;
            setCoins(newCoins);
            save({coins:newCoins});
            setNotAfford(null);
            setBought(index);
            setTimeout(() => setBought(null), 1500);

            if (item.type == "pets") {
                const newPets = [...inventory.pets, {
                    name: item.name, 
                    house: dogHouse, 
                    pic: item.icon,
                    hunger: 90,
                    happiness: 90,
                }];
                const newInventory = {...inventory, pets:newPets};
                const newAdopted = stats.adopted + 1

                setInventory(newInventory);
                setStats(prev => ({ ...prev, adopted: newAdopted }));
                console.log(newInventory);
                save({inventory:newInventory, stats: { ...stats, adopted: newAdopted }});
            } else if (item.type == "bg") {
                const newbg = [...inventory.bg, {name:item.name, pic:item.icon}];
                const newInventory = {...inventory, bg:newbg};
                setInventory(newInventory);
                console.log(newInventory);
                save({inventory:newInventory});
            } else if (item.type == "food") {
                const boughtAlready = inventory.food.some(row => row.name == item.name);

                if (boughtAlready) {
                    const newFood = inventory.food.map(thing => thing.name == item.name 
                        ? {...thing, amount: thing.amount + 1}: thing);
                    const newInventory = {...inventory, food: newFood};
                    setInventory(newInventory);
                    save({inventory:newInventory});
                } else {
                    const newFood = [...inventory.food, {name: item.name, amount: 1, pic:item.icon}];
                    const newInventory = {...inventory, food: newFood};
                    setInventory(newInventory);
                    save({inventory:newInventory});
                };
            };
        } else {
            setNotAfford(index);
            setTimeout(() => setNotAfford(null), 1000);
        };
    };


    return (
        <div>
            <h1 className="flex justify-between items-center mb-5">
                <span className="text-5xl font-bold">Shop</span>
                <span className="text-yellow-400">{`Coins: $${coins}`}</span>
            </h1>

            <div className='flex gap-2'>
                <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => setShopFilter('pets')}>Pets</button>
                <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => setShopFilter('food')}>Food</button>
                <button className='bg-gray-700 rounded px-2 py-1 text-white w-full hover:bg-gray-900' onClick={() => setShopFilter('bg')}>Background</button>
             </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
                {filteredItems.map((item,index) => (
                    <div 
                    key={index} 
                    className="bg-gray-800 rounded p-6 flex flex-col items-center gap-3">
                        <img src={item.icon}></img>
                        <span className="font-bold">{item.name}</span>
                        <span className="text-yellow-400">${item.price}</span>
                        
                        <button onClick={() => (
                            buyItem(item, index)
                        )} 
                        className={`px-4 py-2 rounded ${
                        notAfford == index ? "bg-red-600"
                        : "bg-green-600 hover:bg-green-700"}`}>
                            {notAfford == index ? "NOT ENOUGH" : bought == index ? "BOUGHT!" : "BUY"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ShopPage;