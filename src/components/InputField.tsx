import React, { ChangeEvent } from "react";

interface InputProps {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  type?: string;
  isTextArea?: boolean;
  error?: string;
}

const InputField: React.FC<InputProps> = ({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  isTextArea = false,
  error,
}) => {
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
