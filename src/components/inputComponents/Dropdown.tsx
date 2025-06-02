interface DropdownProps<T> {
    options: T[];
    selectedValue: T;
    onChange: (value: T) => void;
    placeholder?: string;
    getOptionLabel?: (option: T) => string; // Optional function to customize labels
}

export default function Dropdown<T extends string | number>({
                                                                options,
                                                                selectedValue,
                                                                onChange,
                                                                placeholder = "Select an option",
                                                                getOptionLabel,
                                                            }: DropdownProps<T>) {
    return (
        <select
            value={selectedValue}
            onChange={(e) => onChange(e.target.value as T)}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-xs focus:ring-blau-500 focus:border-blau-500"
        >
            {placeholder && (
                <option key={placeholder} value={placeholder} disabled>
                    {placeholder}
                </option>
            )}
            {options.filter(value => value !== placeholder).map((option) => (
                <option key={option} value={option}>
                    {getOptionLabel ? getOptionLabel(option) : option}
                </option>
            ))}
        </select>
    );
}
