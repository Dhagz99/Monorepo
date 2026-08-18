
import MainModal from "@/components/modal/mainModal";
import SweetAlert from "@/components/modal/Swal";
import { useCreateCompany, useUpdateCompany } from "@/hooks/general/useGeneral";
import { CompanySetting } from "@repo/shared";
import axios from "axios";
import { useState } from "react";

interface Props {
  Companies: CompanySetting[];

  isAddCompanyOpen: boolean;

  setIsAddCompanyOpen:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;
}
type CompanyForm = {
  companyName: string;
};


export default function CompanySettings({
  Companies,
  isAddCompanyOpen,
  setIsAddCompanyOpen,
}: Props) {

    const [
      selectedCompany,
      setSelectedCompany,
    ] =
      useState<CompanySetting | null>(
        null
      );

    const [
        companyForm,
        setCompanyForm,
      ] =
        useState<CompanyForm>({
          companyName: "",
        });
      
    
  
    const [
      addCompanyForm,
      setAddCompanyForm,
    ] = useState({
      companyCode: "",
      companyName: ""
    });


  const createCompanyMutation =
        useCreateCompany();

  const updateCompanyMutation =
      useUpdateCompany();


  
  const handleCreateBranch =
  async () => {
    const companyCode =
      addCompanyForm.companyCode
        .trim()
        .toUpperCase();

    const companyName =
      addCompanyForm.companyName
        .trim();

  
    if (!companyCode) {
      SweetAlert.errorAlert(
        "Validation Error",
        "Company code is required."
      );

      return;
    }


    if (!companyName) {
      SweetAlert.errorAlert(
        "Validation Error",
        "Company Name is required."
      );

      return;
    }

    try {
      await createCompanyMutation.mutateAsync({
        companyCode,
        companyName
      });

      await SweetAlert.successAlert(
        "Company Created",
        "Company created successfully."
      );

      setAddCompanyForm({
        companyCode: "",
        companyName: ""
      });

      setIsAddCompanyOpen(false);

    } catch (error: unknown) {
      let message =
        "Unable to create company.";

      if (
        axios.isAxiosError<{
          message?: string;
        }>(error)
      ) {
        message =
          error.response?.data
            ?.message ??
          message;
      }

      SweetAlert.errorAlert(
        "Create Failed",
        message
      );
    }
  };

  const handleCloseEdit = () => {
    setSelectedCompany(
      null
    );

    setCompanyForm({
      companyName: "",
    });
  };


    const handleEdit = (
        comp: CompanySetting
      ) => {
        setSelectedCompany(
          comp
        );
    
        setCompanyForm({
          companyName:
            comp.companyName ?? ""
        });
      };
    


   const handleUpdate = async () => {
    if (!selectedCompany) {
      return;
    }

    const companyName =
      companyForm.companyName.trim();

    if (!companyName) {
      SweetAlert.errorAlert(
        "Validation Error",
        "Company name is required."
      );

      return;
    }

    try {
      await updateCompanyMutation.mutateAsync({
        companyCode:
          selectedCompany.companyCode,
        
        actionType:
          "EDIT",

        payload: {
          companyName,

        },
      });

      await SweetAlert.successAlert(
        "Updated",
        "Company updated successfully."
      );

      handleCloseEdit();

    } catch (
      error: unknown
    ) {
      let message =
        "Unable to update company.";

      if (
        axios.isAxiosError<{
          message?: string;
        }>(error)
      ) {
        message =
          error.response?.data
            ?.message ??
          message;
      } else if (
        error instanceof Error
      ) {
        message =
          error.message;
      }

      SweetAlert.errorAlert(
        "Update Failed",
        message
      );
    }
  };


  const handleDelete = (
    company: CompanySetting
  ) => {
    SweetAlert.confirmationAlert(
      "Delete Company",
      `Are you sure you want to delete ${company.companyName}`,
      async () => {
        try {
          await updateCompanyMutation.mutateAsync({
            companyCode:
              company.companyCode,
            actionType:
              "DELETE",
          });

          await SweetAlert.successAlert(
            "Deleted",
            "Company deleted successfully."
          );
        }catch (
          error:unknown
        ) {
          let message =
            "Unable to delete company.";

          if (
            axios.isAxiosError<{
                message?: string;
            }>(error)
          ) {
            message = 
              error.response?.data 
                ?.message ??
              message;
          }else if (
            error instanceof Error
          ) {
            message = error.message;
          }
          SweetAlert.errorAlert(
            "Delete Failed",
            message
          );
        }
      }
    );
  };

  
 
  const handleCloseCreateCompany =
    () => {
      setAddCompanyForm({
        companyCode: "",
        companyName: ""
      });

      setIsAddCompanyOpen(false);
    };

  return (
    <>
      <div
        className="
          h-82
          overflow-y-auto
          border
          border-neutralMed
          rounded-xl
        "
      >


        <table className="w-full">
          <thead
            className="
              sticky
              top-0
              bg-white
              z-10
              border-b
              border-neutralMed
            "
          >
            <tr className="text-neutralPrimary">
              <th className="text-left px-custom-24 py-custom-16 font-semibold">
                Company Code
              </th>

              <th className="text-left px-custom-24 py-custom-16 font-semibold">
                Company Name
              </th>

              <th className="text-left px-custom-24 py-custom-16 font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {Companies.length ===
            0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="
                    text-center
                    py-custom-32
                    text-neutralPrimary
                  "
                >
                  No branch found
                </td>
              </tr>
            ) : (
              Companies.map(
                (
                  comp
                ) => (
                  <tr
                    key={
                      comp.companyCode
                    }
                    className="
                      border-b
                      border-neutralLight
                      hover:bg-neutralLight
                      transition-colors
                    "
                  >
                    <td className="px-custom-24 py-custom-16 font-medium">
                      {
                        comp.companyCode ??
                        "-"
                      }
                    </td>

                    <td className="px-custom-24 py-custom-16">
                      {
                        comp.companyName ??
                        "-"
                      }
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-start gap-2">
                        <button
                          type="button"
                           onClick={() =>
                            handleEdit(
                              comp
                            )
                          }
                          className="
                            rounded-lg
                            bg-secondary
                            px-custom-16
                            py-custom-8
                            text-xs
                            font-semibold
                            text-white
                            cursor-pointer
                            hover:opacity-90
                          "
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            updateCompanyMutation.isPending
                          }
                          onClick={() =>
                            handleDelete(
                              comp
                            )
                          }
                          className="
                            rounded-lg
                            bg-negative
                            px-custom-16
                            py-custom-8
                            text-xs
                            font-semibold
                            text-white
                            cursor-pointer
                            hover:opacity-90
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>


        
              {isAddCompanyOpen && (
                  <MainModal
                    size="md"
                    onClose={
                        handleCloseCreateCompany
                      }
                  >
                    <div className="flex flex-col gap-custom-24 p-custom-32">
                      <div>
                        <h2 className="text-mdHeader font-bold text-mainPrimary">
                          Create Company
                        </h2>
        
                        <p className="text-sm text-neutralPrimary">
                         Create new company for new branch assignment.
                        </p>
                      </div>
        
                      <div className="flex flex-col gap-custom-16">
        
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">
                            Company Code
                          </label>
        
                          <input
                            value={
                              addCompanyForm.companyCode
                            }
                            onChange={(event) =>
                              setAddCompanyForm(
                                previous => ({
                                  ...previous,
                                  companyCode:
                                    event.target.value
                                      .toUpperCase(),
                                })
                              )
                            }
                            placeholder="Example: BR001"
                            className="
                              border
                              border-neutralMed
                              rounded-lg
                              px-4
                              py-3
                              outline-none
                              focus:border-mainPrimary
                            "
                          />
                        </div>
        
        
        
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">
                            Company Name
                          </label>
        
                          <input
                            value={
                              addCompanyForm.companyName
                            }
                            onChange={(event) =>
                              setAddCompanyForm(
                                previous => ({
                                  ...previous,
                                  companyName:
                                    event.target.value,
                                })
                              )
                            }
                            className="
                              border
                              border-neutralMed
                              rounded-lg
                              px-4
                              py-3
                            "
                          />
                        </div>
        
                      </div>
        
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={
                            handleCloseCreateCompany
                          }
                          className="
                            border
                            border-neutralMed
                            px-custom-16
                            py-custom-8
                            rounded-lg
                          "
                        >
                          Cancel
                        </button>
        
                        <button
                          type="button"
                          disabled={
                            createCompanyMutation.isPending
                          }
                          onClick={
                            handleCreateBranch
                          }
                          className="
                            bg-positive
                            text-white
                            px-custom-16
                            py-custom-8
                            rounded-lg
                            font-semibold
                            disabled:opacity-50
                          "
                        >
                          {createCompanyMutation.isPending
                            ? "Creating..."
                            : "Create Branch"}
                        </button>
                      </div>
                    </div>
                  </MainModal>
                )}



                 {selectedCompany && (
                        <MainModal
                          size="md"
                          onClose={
                            handleCloseEdit
                          }
                        >
                          <div className="flex flex-col gap-custom-24 p-custom-32">
                            <div>
                              <h2 className="text-mdHeader font-bold text-mainPrimary">
                                Edit Company
                              </h2>
                
                              <p className="text-sm text-neutralPrimary">
                                Update Company
                                information.
                              </p>
                            </div>
                
                            <div className="flex flex-col gap-custom-16">
                              <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">
                                  Company Code
                                </label>
                
                                <input
                                  value={
                                    selectedCompany.companyCode
                                  }
                                  readOnly
                                  className="
                                    border
                                    border-neutralMed
                                    bg-neutralLight
                                    rounded-lg
                                    px-4
                                    py-3
                                    cursor-not-allowed
                                  "
                                />
                              </div>
                
                
                              <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">
                                  Company Name
                                </label>
                
                                <input
                                  value={
                                    companyForm.companyName
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setCompanyForm(
                                      (
                                        previous
                                      ) => ({
                                        ...previous,
                
                                        companyName:
                                          event
                                            .target
                                            .value,
                                      })
                                    )
                                  }
                                  className="
                                    border
                                    border-neutralMed
                                    rounded-lg
                                    px-4
                                    py-3
                                    outline-none
                                    focus:border-mainPrimary
                                  "
                                />
                              </div>
                

                            </div>
                
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={
                                  handleCloseEdit
                                }
                                className="
                                  border
                                  border-neutralMed
                                  px-custom-16
                                  py-custom-8
                                  rounded-lg
                                  cursor-pointer
                                "
                              >
                                Cancel
                              </button>
                
                              <button
                                type="button"
                                disabled={
                                  updateCompanyMutation.isPending
                                }
                                onClick={
                                  handleUpdate
                                }
                                className="
                                  bg-mainPrimary
                                  text-white
                                  px-custom-16
                                  py-custom-8
                                  rounded-lg
                                  cursor-pointer
                                  disabled:opacity-50
                                  disabled:cursor-not-allowed
                                "
                              >
                                {updateCompanyMutation.isPending
                                  ? "Saving..."
                                  : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        </MainModal>
                      )}
        
      </div>

     
    </>
  );
}