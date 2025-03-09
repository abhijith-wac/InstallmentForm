import React from "react";
import { Table } from "react-bootstrap";
import { Form, Input } from "informed"; // Import Informed components
import CustomDateInput from "../customFields/CustomDateInput";
import { validateDueDate } from "../customHooks/validations";

const InstallmentTable = ({ installments = [], handleCheckboxChange }) => {
    return (
        <Form>
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
                        .map((installment) => (
                            <tr key={installment.id}>
                                <td>
                                    <Input
                                        type="checkbox"
                                        name={`checkbox-${installment.id}`}
                                        onChange={() => handleCheckboxChange(installment.id)}
                                        defaultValue={installment.isChecked}
                                    />
                                </td>
                                <td>{installment.id}</td>
                                <td>{installment.amount?.toFixed(2) ?? "0.00"}</td>
                                <td>
                                    <CustomDateInput name="due_date" validate={validateDueDate} required />
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </Form>
    );
};

export default InstallmentTable;
