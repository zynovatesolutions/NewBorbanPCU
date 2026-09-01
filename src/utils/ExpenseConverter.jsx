export const ConvertExpenseTypeToText = (ExpenseType) => {
  switch (ExpenseType) {
    case 1:
      return "Rent";
      break;
    case 2:
      return "Kitchen";
      break;
    case 3:
      return "Salary";
      break;
    case 4:
      return "Other";
      break;
  }
};
