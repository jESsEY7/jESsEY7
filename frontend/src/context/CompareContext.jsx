import React, { createContext, useState, useContext, useEffect } from 'react';

const CompareContext = createContext();

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState(() => {
        const saved = localStorage.getItem('compare_vehicles');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('compare_vehicles', JSON.stringify(compareItems));
    }, [compareItems]);

    const addToCompare = (vehicle) => {
        if (compareItems.find(item => item.id === vehicle.id)) return;
        if (compareItems.length >= 4) {
            // Optional: Show a toast or alert
            return false;
        }
        setCompareItems(prev => [...prev, vehicle]);
        return true;
    };

    const removeFromCompare = (vehicleId) => {
        setCompareItems(prev => prev.filter(item => item.id !== vehicleId));
    };

    const clearCompare = () => {
        setCompareItems([]);
    };

    const isInCompare = (vehicleId) => {
        return compareItems.some(item => item.id === vehicleId);
    };

    const toggleCompare = (vehicle) => {
        if (isInCompare(vehicle.id)) {
            removeFromCompare(vehicle.id);
        } else {
            addToCompare(vehicle);
        }
    };

    return (
        <CompareContext.Provider value={{
            compareItems,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare,
            toggleCompare
        }}>
            {children}
        </CompareContext.Provider>
    );
};
