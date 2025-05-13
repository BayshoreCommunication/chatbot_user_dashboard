import React, { useContext } from 'react';
import { ThemeColorContext } from '@/context/ThemeColorContext';

const AppearanceColor: React.FC = () => {
    const { handleColorChange } = useContext(ThemeColorContext);

    return (
        <div>
            <div>
                <h2 className="text-lg font-bold">Select Theme Color</h2>
                <br />
                <div className="flex gap-4 w-full">
                    <button
                        onClick={() =>
                            handleColorChange({
                                textColor1: 'text-red-500',
                                textColor2: 'text-red-400',
                                bgColor1: 'bg-red-300',
                                bgColor2: 'bg-red-500',

                            })
                        }
                        className={`w-full p-2 bg-red-500 rounded hover:bg-red-300`}
                    >
                        Red
                    </button>
                    <button
                        onClick={() =>
                            handleColorChange({
                                textColor1: 'text-green-500',
                                textColor2: 'text-green-400',
                                bgColor1: 'bg-green-300',
                                bgColor2: 'bg-green-500',
                                // SettextColor2 for Green
                            })
                        }
                        className={`w-full p-2 bg-green-500 rounded hover:bg-green-300`}
                    >
                        Green
                    </button>


                </div>

            </div>
        </div>
    );
};

export default AppearanceColor;
