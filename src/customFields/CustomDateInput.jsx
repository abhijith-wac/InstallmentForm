import React from "react";
import { useField } from "informed";

const CustomDateInput = ({
  name,
  label,
  validate,
  validateOn = "change",
  validateOnBlur = true,
  showErrorIfDirty = true,
  required,
  ...props
}) => {
  const { fieldState, fieldApi, ref } = useField({
    name,
    validate,
    validateOn,
    required,
    showErrorIfDirty,
    ...props,
  });

  const { value, error, showError } = fieldState;
  const { setValue, setTouched } = fieldApi;

  // Disable past dates by setting min to tomorrow's date
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().split("T")[0];

  const handleBlur = () => {
    if (validateOnBlur) {
      setTouched(true);
    }
  };

  const inputProps = {
    id: name,
    ref,
    type: "date", // Set input type to date
    value: value || "",
    onChange: (e) => setValue(e.target.value),
    onBlur: handleBlur,
    required,
    min: minDate, // Set the minimum selectable date to tomorrow
    ...props,
  };

  return (
    <>
      {label && <label htmlFor={name}>{label}</label>}
      <input {...inputProps} style={showError ? { border: "1px solid red" } : {}} />
      {showError && <small style={{ color: "red" }}>{error}</small>}
    </>
  );
};

export default CustomDateInput;
