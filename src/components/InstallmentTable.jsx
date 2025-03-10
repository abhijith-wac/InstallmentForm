import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table } from "react-bootstrap";
import "../styles/InstallmentTable.css";

const InstallmentTable = ({
  installments = [],
  handleCheckboxChange,
  handleDateChange,
}) => {
  const firstDueDateSelected = installments.some(
    (inst, index) => index === 0 && inst.dueDate
  );

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Select</th>
          <th>Install No</th>
          <th>Amount</th>
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody>
        {installments
          .filter((installment) => installment.show)
          .map((installment, index) => (
            <tr key={installment.id}>
              <td>
                <input
                  type="checkbox"
                  checked={installment.isChecked}
                  onChange={() => handleCheckboxChange(installment.id)}
                  disabled={!installment.dueDate}
                />
              </td>
              <td>{installment.id}</td>
              <td>{installment.amount?.toFixed(2) ?? "0.00"}</td>
              <td>
                <DatePicker
                  selected={
                    installment.dueDate ? new Date(installment.dueDate) : null
                  }
                  onChange={(date) => handleDateChange(installment.id, date)}
                  minDate={
                    installment.dueDateRange?.min
                      ? new Date(installment.dueDateRange.min)
                      : new Date()
                  }
                  maxDate={
                    installment.dueDateRange?.max
                      ? new Date(installment.dueDateRange.max)
                      : undefined
                  }
                  dateFormat="dd-MMM-yyyy"
                  placeholderText="Select Due Date"
                  className={`form-control ${
                    index === 0 && !firstDueDateSelected
                      ? "highlight-border"
                      : ""
                  }`}
                  disabled={index !== 0 && !firstDueDateSelected}
                />
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};

export default InstallmentTable;
