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
  
    const uniqueIds = [
      ...new Set(selectedInstallments.flatMap(inst => 
        typeof inst.id === "string" ? inst.id.split("-").map(Number) : [inst.id]
      ))
    ].sort((a, b) => a - b);
  
    for (let i = 1; i < uniqueIds.length; i++) {
      if (uniqueIds[i] !== uniqueIds[i - 1] + 1) {
        alert("Please select installments in sequential order.");
        return;
      }
    }
  
    const mergedId = uniqueIds.join("-");
  
    const mergedInstallment = {
      id: mergedId,
      amount: selectedInstallments.reduce((sum, inst) => sum + inst.amount, 0),
      isChecked: false, 
      show: true,
      originalInstallments: selectedInstallments.flatMap(inst => inst.originalInstallments || [inst]), 
    };
  
    setMergeHistory(prevHistory => [
      ...prevHistory,
      {
        mergedId: mergedInstallment.id,
        originalInstallments: selectedInstallments,
        mergedInstallment,
      },
    ]);
  
    const updatedInstallments = installments.map(installment =>
      selectedInstallments.some(selected => selected.id === installment.id)
        ? { ...installment, show: false, isChecked: false } 
        : installment
    );
  
    const firstIndex = installments.findIndex(inst => inst.id === selectedInstallments[0].id);
    updatedInstallments.splice(firstIndex, 0, mergedInstallment);
  
    setInstallments(updatedInstallments);
  };
  

  
  const handleUnmerge = () => {
    const selectedMerged = installments.filter(inst => inst.isChecked && inst.id.includes('-'));
  
    if (selectedMerged.length === 0) return;
  
    let updatedInstallments = [...installments];
  
    selectedMerged.forEach(mergedInst => {
      const splitIds = mergedInst.id.split('-'); 
      const firstTwoIds = splitIds.slice(0, 2).join('-'); 
  
      const toRemove = updatedInstallments.filter(inst => 
        inst.id.includes(firstTwoIds)
      );
      
  
      updatedInstallments = updatedInstallments.filter(inst => 
        !toRemove.some(removeInst => removeInst.id === inst.id)
      );
  
      mergedInst.originalInstallments.forEach(original => {
        updatedInstallments = updatedInstallments.map(inst => 
          inst.id === original.id ? { ...inst, show: true } : inst
        );
      });
    });
  
    setInstallments(updatedInstallments);
  };

  const handleSplit = () => {
    const selectedInstallments = installments.filter(inst => inst.isChecked);
  
    if (selectedInstallments.length >= 1) {
      if (selectedInstallments.some(inst => inst.id.includes("."))) {
        alert("An installment can only be split once. Further splitting is not allowed.");
        return;
      }
  
      const uniqueIds = [
        ...new Set(
          selectedInstallments.flatMap(inst => inst.id.toString().split('-'))
        ),
      ].sort((a, b) => Number(a) - Number(b)); 
  
      for (let i = 1; i < uniqueIds.length; i++) {
        if (Number(uniqueIds[i]) !== Number(uniqueIds[i - 1]) + 1) {
          alert("Please select installments in sequential order.");
          return;
        }
      }
  
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
  
      setSplitHistory(prevHistory => [
        ...prevHistory,
        {
          originalIds: selectedInstallments.map(inst => inst.id),
          splitInstallments: splitInstallments.map(s => s.id),
          details: splitInstallments
        },
      ]);
  
      const updatedInstallments = installments.map(installment =>
        selectedInstallments.some(selected => selected.id === installment.id)
          ? { ...installment, show: false, isChecked: false } 
          : installment
      );
  
      const firstIndex = installments.findIndex(inst => inst.id === selectedInstallments[0].id);
  
      updatedInstallments.splice(firstIndex, 0, ...splitInstallments);
  
      setInstallments(updatedInstallments);
    }
  };

  const handleUnsplit = () => {
    const selectedInstallments = installments.filter(inst => inst.isChecked && inst.id.includes("."));

  
    const baseIds = [
      ...new Set(selectedInstallments.map(inst => inst.id.split(".")[0]))
    ];
  
    const installmentsToRemove = installments.filter(inst =>
      baseIds.some(baseId => inst.id.startsWith(`${baseId}.`))
    );
  
  
    let updatedInstallments = installments.filter(
      inst => !installmentsToRemove.some(split => split.id === inst.id)
    );

    const restoredInstallments = updatedInstallments.map(inst =>
      baseIds.includes(inst.id) ? { ...inst, show: true } : inst
  );
    
   
  
    const updatedSplitHistory = splitHistory.filter(
      entry => !baseIds.includes(entry.originalId)
    );
  
    setInstallments(restoredInstallments);
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
    handleUnsplit,
  };
};

export default useInstallments;
