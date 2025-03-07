import React from "react";
import { Table, Form } from "react-bootstrap";

const InstallmentTable = ({ installments = [], handleCheckboxChange }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Select</th>
          <th>Install No</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {installments.map((installment) => (
          <tr key={installment.id}>
            <td>
              <Form.Check
                type="checkbox"
                checked={installment.isChecked}
                onChange={() => handleCheckboxChange(installment.id)}
              />
            </td>
            <td>{installment.id}</td>
            <td>{installment.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default InstallmentTable;
