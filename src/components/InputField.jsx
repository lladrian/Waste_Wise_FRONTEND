import React from "react";

const InputField = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    required,
    pattern = undefined,
    numberOnly = false, // ✅ custom prop
    children, // ✅ accept children
}) => {
    const handleInputChange = (e) => {
        let inputValue = e.target.value;

        // Filter non-digit characters if numberOnly is true
        if (numberOnly) {
            inputValue = inputValue.replace(/\D/g, "");
        }

        // Fire original onChange with cleaned value
        onChange({
            target: {
                name: e.target.name,
                value: inputValue,
            },
        });
    };

    return (
        <div>
            <label className="flex justify-between items-center text-sm font-semibold text-gray-700 mb-2">
                <span>{label}</span>
                {children}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                required={required}
                {...(pattern ? { pattern } : {})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
            />
        </div>
    );
};

export default InputField;
