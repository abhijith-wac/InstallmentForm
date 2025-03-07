import React from "react";
import { Form, Input, Select } from "informed";
import { Row, Col } from "react-bootstrap";

const InstallmentForm = ({ onChange }) => {
  return (
    <Form onChange={onChange}>
      <Row className="mb-3">
        <Col>
          <label>
            Recommended Amount:
            <Input
              name="amount"
              type="number"
              initialValue="80000"
              className="form-control"
            />
          </label>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <label>
            Payment Method:
            <Select
              name="paymentMethod"
              initialValue="Installment Payment"
              className="form-control"
            >
              <option value="Installment Payment">Installment Payment</option>
            </Select>
          </label>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <label>
            Installment Count:
            <Select
              name="installmentCount"
              initialValue="8"
              className="form-control"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </Select>
          </label>
        </Col>
      </Row>
    </Form>
  );
};

export default InstallmentForm;