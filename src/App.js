import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./index.css";

const COST_PER_KM_INR = 8;

const Navbar = ({ selectedCurrency, setSelectedCurrency, exchangeRates, isLoading }) => {
    const getFlagEmoji = (currencyCode) => {
        const exceptions = {
            EUR: "EU",
            USD: "US",
            GBP: "GB",
            XOF: "BF",
            XAF: "CM",
            XCD: "AG",
            AUD: "AU",
            CAD: "CA",
            SGD: "SG",
            CHF: "CH",
            CNY: "CN",
            INR: "IN",
            JPY: "JP",
            KRW: "KR",
            MYR: "MY"
        };
        const countryCode = exceptions[currencyCode] || currencyCode.slice(0, 2);
        return String.fromCodePoint(...[...countryCode.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt()));
    };

    const options = Object.keys(exchangeRates).map((code) => ({
        value: code,
        label: `${getFlagEmoji(code)} ${code}`,
    }));

    return (
        <nav className="navbar">
            <div className="menu">
                <div className="currency-header">Choose Currency</div>
                {!isLoading && options.length > 0 ? (
                    <Select
                        className="currency-dropdown"
                        options={options}
                        value={{
                            value: selectedCurrency,
                            label: `${getFlagEmoji(selectedCurrency)} ${selectedCurrency}`,
                        }}
                        onChange={(selected) => setSelectedCurrency(selected.value)}
                        isSearchable
                        styles={{
                            control: (baseStyles) => ({
                                ...baseStyles,
                                backgroundColor: "rgba(0, 0, 0, 0.32)",
                                color: "white",
                                border: "none",
                                boxShadow: "none",
                            }),
                            singleValue: (baseStyles) => ({
                                ...baseStyles,
                                color: "white",
                            }),
                            menu: (baseStyles) => ({
                                ...baseStyles,
                                backgroundColor: "rgba(0, 0, 0, 0.32)",
                            }),
                            option: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: state.isFocused ? "rgba(255, 255, 255, 0.1)" : "transparent",
                                color: "white",
                            }),
                            input: (baseStyles) => ({
                                ...baseStyles,
                                color: "white",
                            }),
                        }}
                    />
                ) : (
                    <div className="loading-message">Loading currencies...</div>
                )}
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
    "Berlin, Germany": [52.52, 13.405],
    "Amsterdam, Netherlands": [52.3676, 4.9041],
    "Athens, Greece": [37.9838, 23.7275],
    "Istanbul, Turkey": [41.0082, 28.9784],
    "Antalya, Turkey": [36.8969, 30.7133],
    "Budapest, Hungary": [47.4979, 19.0402],
    "Tokyo, Japan": [35.6895, 139.6917],
    "Mumbai, India": [19.076, 72.8777],
    "Bangkok, Thailand": [13.7563, 100.5018],
    "Singapore, Singapore": [1.3521, 103.8198],
    "Bali, Indonesia": [-8.4095, 115.1889],
    "Dubai, UAE": [25.276987, 55.296249],
    "Rio de Janeiro, Brazil": [-22.9068, -43.1729],
    "Marrakech, Morocco": [31.6295, -7.9811],
    "Sydney, Australia": [-33.8688, 151.2093],
    "Melbourne, Australia": [-37.8136, 144.9631],
    "Kuala Lumpur, Malaysia": [3.139, 101.6869],
    "Cairo, Egypt": [30.0444, 31.2357],
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

const App = () => {
    const [fromInput, setFromInput] = useState("");
    const [toInput, setToInput] = useState("");
    const [budgetInput, setBudgetInput] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("INR");
    const [result, setResult] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [exchangeRates, setExchangeRates] = useState({ INR: 1 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("https://open.er-api.com/v6/latest/INR")
            .then((res) => res.json())
            .then((data) => {
                setExchangeRates(data.rates || { INR: 1 });
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching rates:", err);
                setExchangeRates({ INR: 1 });
                setIsLoading(false);
            });
    }, []);
    
    useEffect(() => {
        if (fromInput === "" || toInput === "" || budgetInput === "") {
            setResult("");
            setAlertMessage("");
        }
    }, [fromInput, toInput, budgetInput]);
    

    const updateFromSuggestions = (value) => {
        setFromInput(value);
        setFromSuggestions(
            value
                ? Object.keys(cityData).filter((city) =>
                      city.toLowerCase().startsWith(value.toLowerCase())
                  )
                : []
        );
    };

    const updateToSuggestions = (value) => {
        setToInput(value);
        setToSuggestions(
            value
                ? Object.keys(cityData).filter((city) =>
                      city.toLowerCase().startsWith(value.toLowerCase())
                  )
                : []
        );
    };

    const handleCostCalculation = () => {
        setAlertMessage("");
        if (!fromInput || !toInput) {
            setAlertMessage("Please enter both 'From' and 'To' destinations.");
            setResult("");
            return;
        }

        const fromCoords = cityData[fromInput];
        const toCoords = cityData[toInput];

        if (!fromCoords || !toCoords) {
            setAlertMessage("Invalid 'From' or 'To' destination. Please select from the list.");
            setResult("");
            return;
        }

        const distance = getDistance(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
        const travelCostINR = Math.round(distance * COST_PER_KM_INR);
        const travelCost = Math.round(travelCostINR * (exchangeRates[selectedCurrency] || 1));

        setResult(
            <div className="result-box">
                <h2>Travel Cost Details</h2>
                <p><strong>From:</strong> {fromInput}</p>
                <p><strong>To:</strong> {toInput}</p>
                <p><strong>Estimated Cost:</strong> {selectedCurrency} {travelCost}</p>
            </div>
        );
    };

    const handleBudgetDestinations = () => {
        setAlertMessage("");
        if (!fromInput || !budgetInput) {
            setAlertMessage("Please enter a valid 'From' destination and your budget.");
            setResult("");
            return;
        }

        const fromCoords = cityData[fromInput];
        if (!fromCoords) {
            setAlertMessage("Invalid 'From' destination. Please select from the list.");
            setResult("");
            return;
        }

        const budgetINR = budgetInput / (exchangeRates[selectedCurrency] || 1);
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
    };

    return (
        <div className="app-container">
            <Navbar
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                exchangeRates={exchangeRates}
                isLoading={isLoading}
            />

            <div className="main-box">
                <p className="creator-portfolio">
                    Creator portfolio : <a href="https://www.linkedin.com/in/madhuvanthi-b-762a92287/" target="_blank" rel="noopener noreferrer">link</a>
                </p>
                <h1>🛫 MapMyTrip ({selectedCurrency}) 🌎</h1>

                {alertMessage && <div className="alert-box">{alertMessage}</div>}

                <div className="input-container">
                    <input
                        type="text"
                        placeholder="From Destination"
                        value={fromInput}
                        onChange={(e) => updateFromSuggestions(e.target.value)}
                    />
                    {fromSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {fromSuggestions.map((city) => (
                                <li key={city} onClick={() => {
                                    setFromInput(city);
                                    setFromSuggestions([]);
                                }}>{city}</li>
                            ))}
                        </ul>
                    )}
                    <input
                        type="text"
                        placeholder="To Destination"
                        value={toInput}
                        onChange={(e) => updateToSuggestions(e.target.value)}
                    />
                    {toSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {toSuggestions.map((city) => (
                                <li key={city} onClick={() => {
                                    setToInput(city);
                                    setToSuggestions([]);
                                }}>{city}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="button-container">
                    <button onClick={handleCostCalculation}>Calculate Cost</button>
                    <hr className="white-line" />
                </div>

                <div className="input-container">
                    <input
                        type="number"
                        placeholder={`Enter your budget for one-way flight (${selectedCurrency})`}
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                    />
                </div>

                <div className="button-container">
                    <button onClick={handleBudgetDestinations}>Find Destinations</button>
                </div>

                <div className="result-container">{result}</div>
            </div>
        </div>
    );
};

export default App;
