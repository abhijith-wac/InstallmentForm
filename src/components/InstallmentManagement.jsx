import React, { useRef } from "react";
import useInstallments from "../customHooks/useInstallments";
import InstallmentForm from "./InstallmentForm";
import InstallmentTable from "./InstallmentTable";
import { Container, Button, Row, Col } from "react-bootstrap";

const InstallmentManagement = () => {
  const {
    installments,
    generateInstallments,
    handleCheckboxChange,
    handleMerge,
    handleUnmerge,
    handleSplit,
    handleUnsplit,
    } = useInstallments();

  const previousValues = useRef({ amount: null, installmentCount: null });

  const handleFormChange = ({ values }) => {
    const { amount, installmentCount } = values;

    if (
      amount &&
      installmentCount &&
      (previousValues.current.amount !== amount || previousValues.current.installmentCount !== installmentCount)
    ) {
      generateInstallments(parseFloat(amount), parseInt(installmentCount));

      // Update previous values
      previousValues.current = { amount, installmentCount };
    }
    console.log(values);
  };

  console.log(installments)

  const selectedInstallmentsCount = installments.filter(
    (installment) => installment.isChecked
  ).length;

  const hasNoMergedInstallments = installments.some(inst => inst.isChecked && !inst.id.toString().includes("-"));
  const hasSplitInstallments = installments.some(inst => inst.isChecked && inst.id.toString().includes("."));
  const hasNoSplitInstallments = installments.some(inst => inst.isChecked && !inst.id.toString().includes("."));

  console.log(hasSplitInstallments)


  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <InstallmentForm onChange={handleFormChange} />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <InstallmentTable
            installments={installments}
            handleCheckboxChange={handleCheckboxChange}
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Button
            variant="primary"
            onClick={handleMerge}
            disabled={selectedInstallmentsCount < 2 || hasSplitInstallments}
            className="me-2"
          >
            Merge
          </Button>
          <Button
            variant="secondary"
            onClick={handleUnmerge}
            disabled={selectedInstallmentsCount < 1  || hasNoMergedInstallments}
            className="me-2"
          >
            Unmerge
          </Button>
          <Button
            variant="primary"
            onClick={handleSplit}
            disabled={selectedInstallmentsCount < 1 || hasSplitInstallments}
            className="me-2"
          >
            Split
          </Button>
          <Button
            variant="primary"
            onClick={handleUnsplit}
            disabled={selectedInstallmentsCount < 1 || hasNoSplitInstallments}
            className="me-2"
          >
            Unsplit
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default InstallmentManagement;
