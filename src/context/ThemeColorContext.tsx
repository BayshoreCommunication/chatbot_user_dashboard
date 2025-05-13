import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context
interface ThemeContextType {
    textColor1: string;
    textColor2: string;
    bgColor1: string;
    bgColor2: string;
    handleColorChange: (colorData: { textColor1: string; textColor2: string; bgColor1: string; bgColor2: string; }) => void;
}

export const ThemeColorContext = createContext<ThemeContextType>(null!);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeColorProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [textColor1, setTextColor1] = useState<string>('text-black'); // Default text color 1
    const [textColor2, setTextColor2] = useState<string>('text-gray-600'); // Default text color 2
    const [bgColor1, setBgColor1] = useState<string>('bg-white'); // Default background color 1
    const [bgColor2, setBgColor2] = useState<string>('bg-gray-300'); // Default background color 2

    useEffect(() => {
        const savedTextColor1 = localStorage.getItem('textColor1');
        const savedTextColor2 = localStorage.getItem('textColor2');
        const savedBgColor1 = localStorage.getItem('bgColor1');
        const savedBgColor2 = localStorage.getItem('bgColor2');

        if (savedTextColor1) setTextColor1(savedTextColor1);
        if (savedTextColor2) setTextColor2(savedTextColor2);
        if (savedBgColor1) setBgColor1(savedBgColor1);
        if (savedBgColor2) setBgColor2(savedBgColor2);
    }, []);

    const handleColorChange = (colorData: { textColor1: string; textColor2: string; bgColor1: string; bgColor2: string }) => {
        setTextColor1(colorData.textColor1);
        setTextColor2(colorData.textColor2);
        setBgColor1(colorData.bgColor1);
        setBgColor2(colorData.bgColor2);

        localStorage.setItem('textColor1', colorData.textColor1);
        localStorage.setItem('textColor2', colorData.textColor2);
        localStorage.setItem('bgColor1', colorData.bgColor1);
        localStorage.setItem('bgColor2', colorData.bgColor2);
    };

    return (
        <ThemeColorContext.Provider value={{ textColor1, textColor2, bgColor1, bgColor2, handleColorChange }}>
            {children}
        </ThemeColorContext.Provider>
    );
};
