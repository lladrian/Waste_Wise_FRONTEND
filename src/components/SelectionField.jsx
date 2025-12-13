import React from "react";

const SelectionField = ({
    label = "Gender",
    name = "gender",
    value,
    onChange,
    required = false,
    options = [], // Array of { value: string, label: string }
    children, // ✅ accept children
}) => {
    return (
        <div>
            <label className="flex justify-between items-center text-sm font-semibold text-gray-700 mb-2">
                <span>{label}</span>
                {children}
            </label>

            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
            >
                <option value="" disabled>
                    {/* Select Your {label.toLowerCase()} */}
                    Select Your {label.charAt(0).toUpperCase() + label.slice(1)}
                </option>
                {options.map(({ value: optionValue, label: optionLabel }) => (
                    <option key={optionValue} value={optionValue}>
                        {optionLabel}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectionField;
