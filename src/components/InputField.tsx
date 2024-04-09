import React, { ChangeEvent } from "react";

interface Option {
  value: string;
  label: string;
}

interface InputProps {
  name: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  type?: string;
  isTextArea?: boolean;
  isSelect?: boolean;
  options?: Option[];
  error?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputProps> = ({
  name,
  value,
  onChange,
  onSelectChange,
  placeholder,
  type = "text",
  isTextArea = false,
  isSelect = false,
  options = [],
  error,
}) => {
  if (isSelect) {
    return (
      <div className="flex flex-col">
        <select
          name={name}
          value={value}
          onChange={
            (onSelectChange as (e: ChangeEvent<HTMLSelectElement>) => void) ||
            onChange
          }
          className={`mb-4 w-full rounded border p-2 ${error ? "border-red-500" : ""}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <div className="text-red-500">{error}</div>}
      </div>
    );
  }

  const InputComponent = isTextArea ? "textarea" : "input";

  return (
    <div className="flex flex-col">
      <InputComponent
        type={type}
        name={name}
        value={value as string}
        onChange={onChange}
        placeholder={placeholder}
        className={`mb-4 w-full rounded border p-2 ${error ? "border-red-500" : ""}`}
      />
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default InputField;
