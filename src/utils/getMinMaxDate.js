export const getMinMaxDate = (installments, id) => {
  const index = installments.findIndex((inst) => inst.id === id);
  if (index === -1) return { minDate: null, maxDate: null };

  const prevInstallment = installments[index - 1] || null;
  const nextInstallment = installments[index + 1] || null;

  let minDate = prevInstallment?.dueDate
    ? new Date(prevInstallment.dueDate)
    : null;
  let maxDate = nextInstallment?.dueDate
    ? new Date(nextInstallment.dueDate)
    : null;

  if (index === 0) {
    minDate = new Date();
  }

  if (maxDate) {
    maxDate.setDate(maxDate.getDate() - 1);
  }

  if (id.includes(".")) {
    const baseId = id.split(".")[0];
    const baseInstallment = installments.find((inst) => inst.id === baseId);
    const firstSplit = installments.find((inst) => inst.id === `${baseId}.1`);
    const nextInstallment = installments.find(
      (inst) => inst.id === `${parseInt(baseId) + 1}`
    );

    if (id.endsWith(".1") && baseInstallment?.dueDate) {
      minDate = new Date(baseInstallment.dueDate);
      maxDate = nextInstallment?.dueDate
        ? new Date(nextInstallment.dueDate)
        : null;

      if (maxDate) {
        maxDate.setDate(maxDate.getDate() - 2);
      }
    }

    if (id.endsWith(".2") && firstSplit?.dueDate) {
      minDate = new Date(firstSplit.dueDate);
      maxDate = nextInstallment?.dueDate
        ? new Date(nextInstallment.dueDate)
        : null;

      if (maxDate) {
        maxDate.setDate(maxDate.getDate() - 1);
      }
    }
  }

  return { minDate, maxDate };
};
