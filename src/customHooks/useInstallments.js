import { useState } from "react";

const useInstallments = () => {
  const [installments, setInstallments] = useState([]);
  const [mergeHistory, setMergeHistory] = useState([]);
  const [splitHistory, setSplitHistory] = useState([]);


  const generateInstallments = (amount, installmentCount, dueDate) => {
    const baseAmount = Math.floor(amount / installmentCount);
    const remainder = amount % installmentCount;
  
    const newInstallments = Array.from({ length: installmentCount }, (_, i) => ({
      id: String(i + 1),
      amount: i === installmentCount - 1 ? baseAmount + remainder : baseAmount,
      isChecked: false,
      show: true,
    }));
  
    setInstallments(newInstallments);
  };
  
  const handleCheckboxChange = (id) => {
    setInstallments((prevInstallments) =>
      prevInstallments.map((installment) =>
        installment.id === id
          ? { ...installment, isChecked: !installment.isChecked }
          : installment
      )
    );
  };
  
  

  const handleMerge = () => {
    const selectedInstallments = installments.filter(inst => inst.isChecked);
  
    if (selectedInstallments.length >= 2) {
      // Extract unique IDs from selected installments
      const uniqueIds = [
        ...new Set(
          selectedInstallments.flatMap(inst => inst.id.toString().split('-'))
        ),
      ].sort((a, b) => Number(a) - Number(b)); // Ensure numeric sorting
  
      // Check if the selection is sequential
      for (let i = 1; i < uniqueIds.length; i++) {
        if (Number(uniqueIds[i]) !== Number(uniqueIds[i - 1]) + 1) {
          alert("Please select installments in sequential order.");
          return;
        }
      }
  
      // Generate new merged ID
      const mergedId = uniqueIds.join('-');
  
      // Create new merged installment
      const mergedInstallment = {
        id: mergedId,
        amount: selectedInstallments.reduce((sum, inst) => sum + inst.amount, 0),
        isChecked: false, // Ensure merged item starts unchecked
        show: true,
        originalInstallments: selectedInstallments,
      };
  
      // Store in merge history
      setMergeHistory(prevHistory => [
        ...prevHistory,
        {
          mergedId: mergedInstallment.id,
          originalInstallments: selectedInstallments,
          mergedInstallment,
        },
      ]);
  
      // Hide merged installments & disable isChecked
      const updatedInstallments = installments.map(installment => 
        selectedInstallments.some(sorted => sorted.id === installment.id)
          ? { ...installment, show: false, isChecked: false } // Hide & uncheck
          : installment
      );
  
      // Find the position of the first selected installment
      const firstIndex = installments.findIndex(inst => inst.id === selectedInstallments[0].id);
  
      // Insert merged installment at the correct position
      updatedInstallments.splice(firstIndex, 0, mergedInstallment);
  
      // Update state with new order
      setInstallments(updatedInstallments);
    }
  };
  
  
    
  
  const handleUnmerge = () => {
    const selectedMerged = installments.filter(inst => inst.isChecked && inst.id.includes('-'));
  
    if (selectedMerged.length === 0) return;
  
    let updatedInstallments = [...installments];
  
    selectedMerged.forEach(mergedInst => {
      const splitIds = mergedInst.id.split('-'); // Extract IDs from merged installment
      const firstTwoIds = splitIds.slice(0, 2).join('-'); // Get first two digits as a merged reference
  
      // Find all installments containing the firstTwoIds (e.g., 1-2 and 1-2-3)
      const toRemove = updatedInstallments.filter(inst => 
        inst.id.includes(firstTwoIds) && inst.id.includes(mergedInst.id)
      );
  
      // Remove the found merged installments from the array
      updatedInstallments = updatedInstallments.filter(inst => 
        !toRemove.some(removeInst => removeInst.id === inst.id)
      );
  
      // Restore the original individual installments by setting `show: true`
      mergedInst.originalInstallments.forEach(original => {
        updatedInstallments = updatedInstallments.map(inst => 
          inst.id === original.id ? { ...inst, show: true } : inst
        );
      });
    });
  
    // Update state
    setInstallments(updatedInstallments);
  };

  const handleSplit = () => {
    const selectedInstallments = installments.filter(inst => inst.isChecked);
  
    if (selectedInstallments.length >= 1) {
      // Prevent splitting an already split installment (IDs containing ".")
      if (selectedInstallments.some(inst => inst.id.includes("."))) {
        alert("An installment can only be split once. Further splitting is not allowed.");
        return;
      }
  
      // Extract unique IDs from selected installments
      const uniqueIds = [
        ...new Set(
          selectedInstallments.flatMap(inst => inst.id.toString().split('-'))
        ),
      ].sort((a, b) => Number(a) - Number(b)); // Ensure numeric sorting
  
      // Check if the selection is sequential
      for (let i = 1; i < uniqueIds.length; i++) {
        if (Number(uniqueIds[i]) !== Number(uniqueIds[i - 1]) + 1) {
          alert("Please select installments in sequential order.");
          return;
        }
      }
  
      // Create split installments (only allow 2 parts)
      const splitInstallments = selectedInstallments.flatMap(inst => [
        {
          id: `${inst.id}.1`,
          amount: inst.amount / 2,
          isChecked: false,
          show: true,
          originalInstallment: inst.id,
        },
        {
          id: `${inst.id}.2`,
          amount: inst.amount / 2,
          isChecked: false,
          show: true,
          originalInstallment: inst.id,
        }
      ]);
  
      // Store in split history
      setSplitHistory(prevHistory => [
        ...prevHistory,
        {
          originalIds: selectedInstallments.map(inst => inst.id),
          splitInstallments: splitInstallments.map(s => s.id),
          details: splitInstallments
        },
      ]);
  
      // Hide split installments & disable isChecked
      const updatedInstallments = installments.map(installment =>
        selectedInstallments.some(selected => selected.id === installment.id)
          ? { ...installment, show: false, isChecked: false } // Hide & uncheck
          : installment
      );
  
      // Find the position of the first selected installment
      const firstIndex = installments.findIndex(inst => inst.id === selectedInstallments[0].id);
  
      // Insert split installments at the correct position
      updatedInstallments.splice(firstIndex, 0, ...splitInstallments);
  
      // Update state with new order
      setInstallments(updatedInstallments);
    }
  };
  


  return {
    installments,
    mergeHistory,
    splitHistory,
    generateInstallments,
    handleCheckboxChange,
    handleMerge,
    handleUnmerge,
    handleSplit,
    // handleUnsplit,
  };
};

export default useInstallments;
