import Swal from "sweetalert2";

const SweetAlert = {


  
  loadingAlert: (title: string = "Loading...", text: string = "") => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },



    
  successAlert: (title: string = "Success", text: string = "") => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText: "Confirm",
      confirmButtonColor: "#6CCC84",
    });
  },

  successAlertFunction: (title: string = "Success", text: string = "",  runFuction: () => void,  onCLose: () => void ) => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText: "Confirm",
      confirmButtonColor: "#6CCC84",
    }).then((result) => {
        if (result.isConfirmed && typeof runFuction === "function" || result.isDismissed) {
            runFuction();
            onCLose();
        }
      });
  },

  warningAlert: (title: string = "Warning", text: string = "") => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: "#6CCC84",
      cancelButtonColor: "#464646",
    });
  },

  errorAlert: (title: string = "Error", text: string = "") => {
    return Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "Confirm",
      confirmButtonColor: "#6CCC84",
    });
  },



  confirmationAlert: (
    title: string = "Are you sure?",
    text: string = "",
    onConfirm?: () => void,
    onCancel?: () => void


  ) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#6CCC84",
      cancelButtonColor: "#464646",
      customClass: {
        popup: "custom-swal-popup",
      },

    }).then((result) => {
      if (result.isConfirmed && typeof onConfirm === "function") {
        onConfirm();
      }

      if (result.isDismissed && typeof onCancel === "function") {
        onCancel();
      }
    });
  },

    remarksConfirmationAlert: (
    title: string = "Are you sure?",
    text: string = "",
    placeholder: string = "Enter remarks",
    onConfirm: (remarks: string) => void
  ) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      input: "textarea",
      inputPlaceholder: placeholder,
      inputAttributes: {
        rows: "4",
      },
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#6CCC84",
      cancelButtonColor: "#464646",
       customClass: {
        popup: "custom-swal-popup",
      },
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage("Remarks are required");
          return false;
        }
        return value;
      },
    }).then((result) => {
      if (result.isConfirmed && typeof onConfirm === "function") {
        onConfirm(result.value);
      }
    });
  },

  
remarksConfirmationAlertandDropdown: (
   title: string,
  text: string,
  options: { value: string; label: string }[],
  onConfirm: (data: { reason: string; amount: number }) => void
) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",

    width: 500, 
    customClass: {
      popup: "swal-no-scroll",
    },

    

    html: `
      <div style="display:flex; flex-direction:column; gap:16px; margin-top:10px; width:100%;">
        
        <select id="swal-reason"
          style="
            width:100%;
            padding:10px;
            border:1px solid #d1d5db;
            border-radius:6px;
            font-size:14px;
          ">
          <option value="">Select reason</option>
          ${options
            .map(
              (opt) =>
                `<option value="${opt.value}">${opt.label}</option>`
            )
            .join("")}
        </select>

        <input 
          type="number" 
          id="swal-amount"
          placeholder="Enter increase amount"
          style="
            width:100%;
            padding:10px;
            border:1px solid #d1d5db;
            border-radius:6px;
            font-size:14px;
            box-sizing:border-box;
          "
        />
      </div>
    `,

    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#6CCC84",
    cancelButtonColor: "#464646",

    preConfirm: () => {
      const reason = (
        document.getElementById("swal-reason") as HTMLSelectElement
      )?.value;

      const amountValue = (
        document.getElementById("swal-amount") as HTMLInputElement
      )?.value;

      const amount = Number(amountValue);

      if (!reason) {
        Swal.showValidationMessage("Please select a reason");
        return false;
      }

      if (!amountValue || amount <= 0) {
        Swal.showValidationMessage("Please enter a valid amount");
        return false;
      }

      return { reason, amount };
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      onConfirm(result.value);
    }
  });
},

  remarksConfirmationAlertDropdown: (
  title: string = "Are you sure?",
  text: string = "",
  options: { value: string; label: string }[],
  onConfirm: (remarks: string) => void
) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    input: "select",
    inputOptions: options.reduce((acc, curr) => {
      acc[curr.value] = curr.label;
      return acc;
    }, {} as Record<string, string>),
    inputPlaceholder: "Select reason",
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#6CCC84",
    cancelButtonColor: "#464646",
    preConfirm: (value) => {
      if (!value) {
        Swal.showValidationMessage("Please select a reason");
        return false;
      }
      return value;
    },
  }).then((result) => {
    if (result.isConfirmed && typeof onConfirm === "function") {
      onConfirm(result.value);
    }
  });
},
};









export default SweetAlert;