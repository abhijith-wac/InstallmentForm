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
  
    if (selectedInstallments.length < 2) {
      alert("Please select at least two installments to merge.");
      return;
    }
  
  
    // Extract unique numeric IDs
    const uniqueIds = [
      ...new Set(selectedInstallments.map(inst => inst.id.toString()))
    ].sort((a, b) => Number(a) - Number(b));
  
    // Ensure selection is sequential
    for (let i = 1; i < uniqueIds.length; i++) {
      if (Number(uniqueIds[i]) !== Number(uniqueIds[i - 1]) + 1) {
        alert("Please select installments in sequential order.");
        return;
      }
    }
  
    // Generate merged ID
    const mergedId = uniqueIds.join("-");
  
    // Create new merged installment
    const mergedInstallment = {
      id: mergedId,
      amount: selectedInstallments.reduce((sum, inst) => sum + inst.amount, 0),
      isChecked: false, 
      show: true,
      originalInstallments: selectedInstallments,
    };
  
    // Store merge history
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
      selectedInstallments.some(selected => selected.id === installment.id)
        ? { ...installment, show: false, isChecked: false } // Hide & uncheck
        : installment
    );
  
    // Insert merged installment at the correct position
    const firstIndex = installments.findIndex(inst => inst.id === selectedInstallments[0].id);
    updatedInstallments.splice(firstIndex, 0, mergedInstallment);
  
    // Update state
    setInstallments(updatedInstallments);
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

  const handleUnsplit = () => {
    const selectedInstallments = installments.filter(inst => inst.isChecked);
  
    if (selectedInstallments.length === 0) {
      alert("Please select a split installment to unsplit.");
      return;
    }
  
    // Get unique base IDs (before ".") from selected split installments
    const baseIds = [
      ...new Set(selectedInstallments.map(inst => inst.id.split(".")[0]))
    ];
  
    // Find all installments that match any base ID with a "."
    const installmentsToRemove = installments.filter(inst =>
      baseIds.some(baseId => inst.id.startsWith(`${baseId}.`))
    );
  
    // Find the original installments that were hidden and need to be restored
    const restoredInstallments = installments
      .filter(inst => baseIds.includes(inst.id) && !inst.id.includes("."))
      .map(inst => ({ ...inst, show: true, isChecked: false }));
  
    // Remove split installments
    let updatedInstallments = installments.filter(
      inst => !installmentsToRemove.some(split => split.id === inst.id)
    );
  
    // Restore original installments at their correct position
    baseIds.forEach(baseId => {
      const originalIndex = installments.findIndex(inst => inst.id === baseId);
      if (originalIndex !== -1) {
        updatedInstallments = [
          ...updatedInstallments.slice(0, originalIndex),
          restoredInstallments.find(inst => inst.id === baseId),
          ...updatedInstallments.slice(originalIndex)
        ];
      }
    });
  
    // Remove corresponding split history entries
    const updatedSplitHistory = splitHistory.filter(
      entry => !baseIds.includes(entry.originalId)
    );
  
    // Update state
    setInstallments(updatedInstallments);
    setSplitHistory(updatedSplitHistory);
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
