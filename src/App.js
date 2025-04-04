import React, { useState } from "react";
import "./index.css";

const currencyRates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    AUD: 0.018,
    SGD: 0.016
};

const Navbar = ({ selectedCurrency, setSelectedCurrency }) => {
    return (
        <nav className="navbar">
            <div className="menu">
                <div className="currency-header">Choose Currency</div>
                <ul className="nav-links">
                    {Object.keys(currencyRates).map((currency) => (
                        <li key={currency} onClick={() => setSelectedCurrency(currency)}>
                            {currency}
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

const cityData = {
    "Paris, France": [48.8566, 2.3522],
    "Rome, Italy": [41.9028, 12.4964],
    "Barcelona, Spain": [41.3851, 2.1734],
    "Madrid, Spain": [40.4168, -3.7038],
    "London, UK": [51.5074, -0.1278],
    "Berlin, Germany": [52.5200, 13.4050],
    "Amsterdam, Netherlands": [52.3676, 4.9041],
    "Athens, Greece": [37.9838, 23.7275],
    "Istanbul, Turkey": [41.0082, 28.9784],
    "Antalya, Turkey": [36.8969, 30.7133],
    "Budapest, Hungary": [47.4979, 19.0402],
    "Tokyo, Japan": [35.6895, 139.6917],
    "Mumbai, India": [19.0760, 72.8777],
    "Bangkok, Thailand": [13.7563, 100.5018],
    "Singapore, Singapore": [1.3521, 103.8198],
    "Bali, Indonesia": [-8.4095, 115.1889],
    "Dubai, UAE": [25.276987, 55.296249],
    "Rio de Janeiro, Brazil": [-22.9068, -43.1729],
    "Marrakech, Morocco": [31.6295, -7.9811],
    "Sydney, Australia": [-33.8688, 151.2093],
    "Melbourne, Australia": [-37.8136, 144.9631],
    "Kuala Lumpur, Malaysia": [3.1390, 101.6869],
    "Cairo, Egypt": [30.0444, 31.2357]
};

const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const COST_PER_KM_INR = 8;

const App = () => {
    const [fromInput, setFromInput] = useState('');
    const [toInput, setToInput] = useState('');
    const [budgetInput, setBudgetInput] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('INR');
    const [result, setResult] = useState('');
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);

    const updateFromSuggestions = (value) => {
        setFromInput(value);
        setFromSuggestions(value ? Object.keys(cityData).filter(city =>
            city.toLowerCase().startsWith(value.toLowerCase())
        ) : []); // Clears suggestions if input is empty
    };
    
    const updateToSuggestions = (value) => {
        setToInput(value);
        setToSuggestions(value ? Object.keys(cityData).filter(city =>
            city.toLowerCase().startsWith(value.toLowerCase())
        ) : []); // Clears suggestions if input is empty
    };
    

    const handleSearch = () => {
        if (!fromInput) {
            setResult("Please enter a valid 'From' destination.");
            return;
        }

        const fromCoords = cityData[fromInput];
        if (!fromCoords) {
            setResult("Invalid 'From' destination. Please select from the list.");
            return;
        }

        if (toInput) {
            // Case 1: Both 'From' and 'To' are given -> Calculate Cost
            const toCoords = cityData[toInput];
            if (!toCoords) {
                setResult("Invalid 'To' destination. Please select from the list.");
                return;
            }

            const distance = getDistance(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
            const travelCostINR = Math.round(distance * COST_PER_KM_INR);
            const travelCost = (travelCostINR * currencyRates[selectedCurrency]).toFixed(2);

            setResult(
                <div className="result-box">
                    <h2>Travel Cost Details</h2>
                    <p><strong>From:</strong> {fromInput}</p>
                    <p><strong>To:</strong> {toInput}</p>
                    <p><strong>Estimated Cost:</strong> {selectedCurrency} {travelCost}</p>
                </div>
            );
        } else if (budgetInput) {
            // Case 2: 'From' + 'Budget' -> Find Possible 'To' Destinations
            const budgetINR = budgetInput / currencyRates[selectedCurrency];
            let possibleDestinations = [];

            Object.keys(cityData).forEach((destination) => {
                if (destination !== fromInput) {
                    const toCoords = cityData[destination];
                    const distance = getDistance(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
                    const travelCostINR = Math.round(distance * COST_PER_KM_INR);

                    if (travelCostINR <= budgetINR) {
                        possibleDestinations.push(destination);
                    }
                }
            });

            if (possibleDestinations.length === 0) {
                setResult("No destinations found within your budget.");
            } else {
                setResult(
                    <div className="result-box">
                        <h2>Possible Destinations</h2>
                        <ul className="destination-list">
                            {possibleDestinations.map((dest) => (
                                <li key={dest} className="destination-item">{dest}</li>
                            ))}
                        </ul>
                    </div>
                );
            }
        } else {
            setResult("Please enter a 'To' destination or a budget.");
        }
    };

    return (
        <div className="app-container">
            <Navbar selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />
            <div className="main-box">
                <h1>MapMyTrip ({selectedCurrency})</h1>

                <div className="input-container">
                <input type="text" placeholder="From Destination" value={fromInput} onChange={(e) => updateFromSuggestions(e.target.value)} />
                    {fromSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {fromSuggestions.map((city) => (
                                <li key={city} className="suggestion-item" onClick={() => { 
                                    setFromInput(city); 
                                    setFromSuggestions([]); 
                                }}>
                                    {city}
                                </li>
                            ))}
                        </ul>
                    )}

                </div>

                <div className="input-container">
                <input type="text" placeholder="To Destination (optional)" value={toInput} onChange={(e) => updateToSuggestions(e.target.value)} />

                    {toSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {toSuggestions.map((city) => (
                                <li key={city} className="suggestion-item" onClick={() => { 
                                    setToInput(city); 
                                    setToSuggestions([]); 
                                }}>
                                    {city}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <input type="text" placeholder={`Enter your budget in ${selectedCurrency} (optional)`} value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} />

                <button onClick={handleSearch}>Search</button>
                <p className="result">{result}</p>
            </div>
        </div>
    );
};

export default App;
