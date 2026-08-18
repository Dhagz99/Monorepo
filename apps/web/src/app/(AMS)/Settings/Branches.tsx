import MainModal from "@/components/modal/mainModal";
import SweetAlert from "@/components/modal/Swal";
import { useCompanyOptions, useCreateBranch, useDeleteBranch, useUpdateBranch } from "@/hooks/general/useGeneral";
import { BranchSetting } from "@repo/shared";
import axios from "axios";
import { useState } from "react";

interface Props {
  Branches: BranchSetting[];

  isAddBranchOpen: boolean;

  setIsAddBranchOpen:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;
}

type BranchForm = {
  companyName: string;
  location: string;
};

export default function BranchSettings({
  Branches,
  isAddBranchOpen,
  setIsAddBranchOpen,
}: Props) {
  const [
    selectedBranch,
    setSelectedBranch,
  ] =
    useState<BranchSetting | null>(
      null
    );

  const [
    branchForm,
    setBranchForm,
  ] =
    useState<BranchForm>({
      companyName: "",
      location: "",
    });
  


  const [
    addBranchForm,
    setAddBranchForm,
  ] = useState({
    branchCode: "",
    companyId: "",
    location: "",
  });

  const {
    data: companyOptions = [],
    isLoading: isLoadingCompanies,
  } = useCompanyOptions();

  const createBranchMutation =
    useCreateBranch();

  const updateBranchMutation =
    useUpdateBranch();

  const deleteBranchMutation =
    useDeleteBranch();

  const handleEdit = (
    branch: BranchSetting
  ) => {
    setSelectedBranch(
      branch
    );

    setBranchForm({
      companyName:
        branch.companyName ?? "",

      location:
        branch.location ?? "",
    });
  };


  const handleCreateBranch =
  async () => {
    const branchCode =
      addBranchForm.branchCode
        .trim()
        .toUpperCase();

    const companyId =
      addBranchForm.companyId
        .trim();

    const location =
      addBranchForm.location
        .trim();

    if (!branchCode) {
      SweetAlert.errorAlert(
        "Validation Error",
        "Branch code is required."
      );

      return;
    }

    if (!companyId) {
      SweetAlert.errorAlert(
        "Validation Error",
        "Please select a company."
      );

      return;
    }

    if (!location) {
      SweetAlert.errorAlert(
        "Validation Error",
        "Branch location is required."
      );

      return;
    }

    try {
      await createBranchMutation.mutateAsync({
        branchCode,
        companyId,
        location,
      });

      await SweetAlert.successAlert(
        "Branch Created",
        "Branch created successfully."
      );

      setAddBranchForm({
        branchCode: "",
        companyId: "",
        location: "",
      });

      setIsAddBranchOpen(false);

    } catch (error: unknown) {
      let message =
        "Unable to create branch.";

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
    setSelectedBranch(
      null
    );

    setBranchForm({
      companyName: "",
      location: "",
    });
  };

  const handleUpdate = async () => {
    if (!selectedBranch) {
      return;
    }

    const companyName =
      branchForm.companyName.trim();

    if (!companyName) {
      SweetAlert.errorAlert(
        "Validation Error",
        "Company name is required."
      );

      return;
    }

    try {
      await updateBranchMutation.mutateAsync({
        branchCode:
          selectedBranch.branchCode,

        payload: {
          companyName,

          location:
            branchForm.location.trim() ||
            null,
        },
      });

      await SweetAlert.successAlert(
        "Updated",
        "Branch updated successfully."
      );

      handleCloseEdit();

    } catch (
      error: unknown
    ) {
      let message =
        "Unable to update branch.";

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
    branch: BranchSetting
  ) => {
    SweetAlert.confirmationAlert(
      "Delete Branch",
      `Are you sure you want to delete ${branch.companyName}?`,
      async () => {
        try {
          await deleteBranchMutation.mutateAsync({
            branchCode:
              branch.branchCode,
          });

          await SweetAlert.successAlert(
            "Deleted",
            "Branch deleted successfully."
          );

        } catch (
          error: unknown
        ) {
          let message =
            "Unable to delete branch.";

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
            "Delete Failed",
            message
          );
        }
      }
    );
  };

  const handleCloseCreateBranch =
  () => {
    setAddBranchForm({
      branchCode: "",
      companyId: "",
      location: "",
    });

    setIsAddBranchOpen(false);
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
                Branch Code
              </th>

              <th className="text-left px-custom-24 py-custom-16 font-semibold">
                Location
              </th>

              <th className="text-left px-custom-24 py-custom-16 font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {Branches.length ===
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
              Branches.map(
                (
                  branch
                ) => (
                  <tr
                    key={
                      branch.branchCode
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
                        branch.branchCode ??
                        "-"
                      }
                    </td>

                    <td className="px-custom-24 py-custom-16">
                      {
                        branch.location ??
                        "-"
                      }
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-start gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              branch
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
                            deleteBranchMutation.isPending
                          }
                          onClick={() =>
                            handleDelete(
                              branch
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
      </div>

      {isAddBranchOpen && (
          <MainModal
            size="md"
            onClose={
                handleCloseCreateBranch
              }
          >
            <div className="flex flex-col gap-custom-24 p-custom-32">
              <div>
                <h2 className="text-mdHeader font-bold text-mainPrimary">
                  Create Branch
                </h2>

                <p className="text-sm text-neutralPrimary">
                  Assign the new branch to an existing company.
                </p>
              </div>

              <div className="flex flex-col gap-custom-16">

                                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">
                    Company
                  </label>

                  <select
                    value={
                      addBranchForm.companyId
                    }
                    onChange={(event) =>
                      setAddBranchForm(
                        previous => ({
                          ...previous,
                          companyId:
                            event.target.value,
                        })
                      )
                    }
                    disabled={
                      isLoadingCompanies
                    }
                    className="
                      border
                      border-neutralMed
                      rounded-lg
                      px-4
                      py-3
                      bg-white
                    "
                  >
                    <option value="">
                      {isLoadingCompanies
                        ? "Loading companies..."
                        : "Select company"}
                    </option>

                    {companyOptions.map(
                      (company) => (
                        <option
                          key={
                            company.companyCode
                          }
                          value={
                            company.companyCode
                          }
                        >
                          {
                            company.companyName
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">
                    Branch Code
                  </label>

                  <input
                    value={
                      addBranchForm.branchCode
                    }
                    onChange={(event) =>
                      setAddBranchForm(
                        previous => ({
                          ...previous,
                          branchCode:
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
                    Location
                  </label>

                  <input
                    value={
                      addBranchForm.location
                    }
                    onChange={(event) =>
                      setAddBranchForm(
                        previous => ({
                          ...previous,
                          location:
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
                    handleCloseCreateBranch
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
                    createBranchMutation.isPending
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
                  {createBranchMutation.isPending
                    ? "Creating..."
                    : "Create Branch"}
                </button>
              </div>
            </div>
          </MainModal>
        )}

      {selectedBranch && (
        <MainModal
          size="md"
          onClose={
            handleCloseEdit
          }
        >
          <div className="flex flex-col gap-custom-24 p-custom-32">
            <div>
              <h2 className="text-mdHeader font-bold text-mainPrimary">
                Edit Branch
              </h2>

              <p className="text-sm text-neutralPrimary">
                Update branch
                information.
              </p>
            </div>

            <div className="flex flex-col gap-custom-16">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">
                  Branch Code
                </label>

                <input
                  value={
                    selectedBranch.branchCode
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
                  Branch Name
                </label>

                <input
                  value={
                    branchForm.companyName
                  }
                  onChange={(
                    event
                  ) =>
                    setBranchForm(
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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">
                  Location
                </label>

                <input
                  value={
                    branchForm.location
                  }
                  onChange={(
                    event
                  ) =>
                    setBranchForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        location:
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
                  updateBranchMutation.isPending
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
                {updateBranchMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </MainModal>
      )}
    </>
  );
}