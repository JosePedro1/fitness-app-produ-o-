import React from "react";

const AuthInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  icon: Icon,
  error,
}) => {
  return (
    <div className="flex flex-col w-full text-[#555555] text-base text-left gap-[10px]">
      <label htmlFor={name} className="font-medium">
        {label}
      </label>
      <div className="flex w-full rounded-lg overflow-hidden">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={type === "password" ? "current-password" : "email"}
          className="flex-1 border-none bg-[#F1F3F6] px-5 py-3 text-[#555555] text-base outline-none focus:ring-2 focus:ring-[#7001FD] focus:ring-inset placeholder-gray-400"
        />
        {Icon && (
          <div className="flex items-center justify-center px-3 bg-[#7001FD] min-w-[46px]">
            <Icon size={20} color="white" />
          </div>
        )}
      </div>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default AuthInput;
