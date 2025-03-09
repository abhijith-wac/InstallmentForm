export const validateDueDate = (value) => {
  if (!value) return "Due date is required";
  
  const selectedDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time part for accurate comparison

  if (selectedDate <= today) {
      return "Select a future date";
  }

  return undefined; // No error
};
