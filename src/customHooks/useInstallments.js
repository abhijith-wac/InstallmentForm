import { useState } from "react";

const useInstallments = () => {
  const [installments, setInstallments] = useState([]);
  const [mergeHistory, setMergeHistory] = useState([]);

  const generateInstallments = (amount, installmentCount, dueDate) => {
    const baseAmount = Math.floor(amount / installmentCount);
    const remainder = amount % installmentCount;
  
    const newInstallments = Array.from({ length: installmentCount }, (_, i) => {
      return {
        id: i + 1, 
        amount: i === installmentCount - 1 ? baseAmount + remainder : baseAmount,
        isChecked: false,
        show: false,
      };
    });
  
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
    const selectedInstallments = installments.filter((installment) => installment.isChecked);
  
    if (selectedInstallments.length >= 2) {
      const sortedInstallments = selectedInstallments.sort(
        (a, b) => parseFloat(a.id) - parseFloat(b.id)
      );
  
      const mergedInstallment = {
        id: sortedInstallments.id[0], 
        amount: sortedInstallments.reduce((sum, inst) => sum + inst.amount, 0), 
        isChecked: false, 
        show: true, 
        originalInstallments: sortedInstallments, 
      };

      setMergeHistory((prevHistory) => [
        ...prevHistory,
        {
          mergedId: mergedInstallment.id,
          originalInstallments: sortedInstallments,
          mergedInstallment: mergedInstallment,
        },
      ]);
  
      const updatedInstallments = installments.map((installment) => {
        if (sortedInstallments.some((sorted) => sorted.id === installment.id)) {
          return { ...installment, show: false }; 
        }
        return installment;
      });
  
      setInstallments([...updatedInstallments, mergedInstallment]); 
    }
  };
  
    
  
  const handleUnmerge = (mergedId) => {
    const [mergedPrefix] = mergedId.split('.');

    const historyEntry = mergeHistory.find((i) => i.id === mergedPrefix);
  
    if (historyEntry) {
      const { originalInstallments } = historyEntry;
  
      const updatedInstallments = installments.map((installment) => {
        const [firstPart] = installment.id.split('.');
        if (originalInstallments.some((original) => original.id === firstPart)) {
          return { ...installment, show: true }; 
        }
        return installment; 
      });
  
      const finalUnmergedInstallments = {
        ...updatedInstallments, 
      };
      setInstallments(finalUnmergedInstallments);
  
      setMergeHistory((prevHistory) =>
        prevHistory.filter((entry) => entry.mergedId !== mergedId)
      );
    }
  };
  
  
  



  return {
    installments,
    mergeHistory,
    generateInstallments,
    handleCheckboxChange,
    handleMerge,
    handleUnmerge,
  };
};

export default useInstallments;
