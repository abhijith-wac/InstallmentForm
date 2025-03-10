import { useState } from "react";

const useInstallments = () => {
  const [installments, setInstallments] = useState([]);

  
  //GenerateInstallments
  const generateInstallments = (amount, installmentCount, dueDate) => {
    const baseAmount = Math.floor(amount / installmentCount);
    const remainder = amount % installmentCount;
    const newInstallments = Array.from(
      { length: installmentCount },
      (_, i) => ({
        id: String(i + 1),
        amount:
          i === installmentCount - 1 ? baseAmount + remainder : baseAmount,
        isChecked: false,
        show: true,
        dueDate: null,
      })
    );
    setInstallments(newInstallments);
  };


  //handleCheckbox
  const handleCheckboxChange = (id) => {
    setInstallments((prevInstallments) =>
      prevInstallments.map((installment) =>
        installment.id === id
          ? { ...installment, isChecked: !installment.isChecked }
          : installment
      )
    );
  };


  //handleDateChange
  const formatDate = (date) => date.toLocaleDateString("en-CA");
  const handleDateChange = (id, selectedDate) => {
    if (!selectedDate) return;

    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);

    if (selectedDateObj < new Date().setHours(0, 0, 0, 0)) {
      alert("Please select a future date (today or later).");
      return;
    }

    setInstallments((prevInstallments) => {
      const updatedInstallments = [...prevInstallments];
      const startIndex = updatedInstallments.findIndex(
        (inst) => inst.id === id
      );

      if (startIndex !== -1) {
        updatedInstallments[startIndex].dueDate = formatDate(selectedDateObj);
        const baseDay = selectedDateObj.getDate();
        for (let i = startIndex + 1; i < updatedInstallments.length; i++) {
          const prevDueDate = new Date(updatedInstallments[i - 1].dueDate);
          if (isNaN(prevDueDate)) break;
          const nextDueDate = new Date(prevDueDate);
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          nextDueDate.setDate(baseDay);
          if (nextDueDate.getMonth() !== (prevDueDate.getMonth() + 1) % 12) {
            nextDueDate.setDate(0);
          }
          updatedInstallments[i].dueDate = formatDate(nextDueDate);
        }
      }

      return updatedInstallments;
    });
  };


  //handleMerge
  const handleMerge = () => {
    const selectedInstallments = installments.filter((inst) => inst.isChecked);
    if (selectedInstallments.length < 2) {
      alert("Please select at least two installments to merge.");
      return;
    }
    const uniqueIds = [
      ...new Set(
        selectedInstallments.flatMap((inst) =>
          typeof inst.id === "string"
            ? inst.id.split("-").map(Number)
            : [inst.id]
        )
      ),
    ].sort((a, b) => a - b);
    for (let i = 1; i < uniqueIds.length; i++) {
      if (uniqueIds[i] !== uniqueIds[i - 1] + 1) {
        alert("Please select installments in sequential order.");
        return;
      }
    }
    const mergedId = uniqueIds.join("-");
    const minDueDate = selectedInstallments.reduce(
      (minDate, inst) =>
        new Date(inst.dueDate) < new Date(minDate) ? inst.dueDate : minDate,
      selectedInstallments[0].dueDate
    );

    const mergedInstallment = {
      id: mergedId,
      amount: selectedInstallments.reduce((sum, inst) => sum + inst.amount, 0),
      isChecked: false,
      show: true,
      dueDate: minDueDate,
      originalInstallments: selectedInstallments.flatMap(
        (inst) => inst.originalInstallments || [inst]
      ),
    };

    const updatedInstallments = installments.map((installment) =>
      selectedInstallments.some((selected) => selected.id === installment.id)
        ? { ...installment, show: false, isChecked: false }
        : installment
    );

    const firstIndex = installments.findIndex(
      (inst) => inst.id === selectedInstallments[0].id
    );
    updatedInstallments.splice(firstIndex, 0, mergedInstallment);

    setInstallments(updatedInstallments);
  };



  //handleUnmerge
  const handleUnmerge = () => {
    const selectedMerged = installments.filter(
      (inst) => inst.isChecked && inst.id.includes("-")
    );

    if (selectedMerged.length === 0) return;

    let updatedInstallments = [...installments];

    selectedMerged.forEach((mergedInst) => {
      const splitIds = mergedInst.id.split("-");
      const firstTwoIds = splitIds.slice(0, 2).join("-");

      const toRemove = updatedInstallments.filter((inst) =>
        inst.id.includes(firstTwoIds)
      );

      updatedInstallments = updatedInstallments.filter(
        (inst) => !toRemove.some((removeInst) => removeInst.id === inst.id)
      );

      mergedInst.originalInstallments.forEach((original) => {
        updatedInstallments = updatedInstallments.map((inst) =>
          inst.id === original.id ? { ...inst, show: true } : inst
        );
      });
    });

    setInstallments(updatedInstallments);
  };


  //handleSplit
  const handleSplit = () => {
    const selectedInstallments = installments.filter((inst) => inst.isChecked);

    if (selectedInstallments.length >= 1) {
      if (selectedInstallments.some((inst) => inst.id.includes("."))) {
        alert(
          "An installment can only be split once. Further splitting is not allowed."
        );
        return;
      }

      const uniqueIds = [
        ...new Set(
          selectedInstallments.flatMap((inst) => inst.id.toString().split("-"))
        ),
      ].sort((a, b) => Number(a) - Number(b));

      for (let i = 1; i < uniqueIds.length; i++) {
        if (Number(uniqueIds[i]) !== Number(uniqueIds[i - 1]) + 1) {
          alert("Please select installments in sequential order.");
          return;
        }
      }

      const splitInstallments = selectedInstallments.flatMap((inst) => {
        const nextInstallment = installments.find(
          (item) => Number(item.id) === Number(inst.id) + 1
        );

        const minDate = new Date(inst.dueDate);
        minDate.setDate(minDate.getDate() + 1);

        let maxDate = null;
        if (nextInstallment?.dueDate) {
          maxDate = new Date(nextInstallment.dueDate);
          maxDate.setDate(maxDate.getDate() - 1);
        }

        return [
          {
            id: `${inst.id}.1`,
            amount: inst.amount / 2,
            isChecked: false,
            show: true,
            dueDate: inst.dueDate,
            originalInstallment: inst.id,
          },
          {
            id: `${inst.id}.2`,
            amount: inst.amount / 2,
            isChecked: false,
            show: true,
            dueDate: "",
            dueDateRange: {
              min: minDate.toISOString().split("T")[0],
              max: maxDate ? maxDate.toISOString().split("T")[0] : null,
            },
            originalInstallment: inst.id,
          },
        ];
      });

      const updatedInstallments = installments.map((installment) =>
        selectedInstallments.some((selected) => selected.id === installment.id)
          ? { ...installment, show: false, isChecked: false }
          : installment
      );

      const firstIndex = installments.findIndex(
        (inst) => inst.id === selectedInstallments[0].id
      );

      updatedInstallments.splice(firstIndex, 0, ...splitInstallments);

      setInstallments(updatedInstallments);
    }
  };


  //handleUnsplit
  const handleUnsplit = () => {
    const selectedInstallments = installments.filter(
      (inst) => inst.isChecked && inst.id.includes(".")
    );

    const baseIds = [
      ...new Set(selectedInstallments.map((inst) => inst.id.split(".")[0])),
    ];

    const installmentsToRemove = installments.filter((inst) =>
      baseIds.some((baseId) => inst.id.startsWith(`${baseId}.`))
    );

    let updatedInstallments = installments.filter(
      (inst) => !installmentsToRemove.some((split) => split.id === inst.id)
    );

    const restoredInstallments = updatedInstallments.map((inst) =>
      baseIds.includes(inst.id) ? { ...inst, show: true } : inst
    );

    const sortedInstallments = restoredInstallments.sort((a, b) => {
      return parseFloat(a.id) - parseFloat(b.id);
    });

    setInstallments(sortedInstallments);
  };

  return {
    installments,
    generateInstallments,
    handleCheckboxChange,
    handleDateChange,
    handleMerge,
    handleUnmerge,
    handleSplit,
    handleUnsplit,
  };
};

export default useInstallments;
