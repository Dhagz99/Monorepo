"use client";
import SweetAlert from "@/components/modal/Swal";
import {
  ArrowBigRight,
} from "lucide-react";

import {
  FieldErrors,
  UseFormRegister,
  UseFormTrigger,
  UseFormGetValues,
} from "react-hook-form";

import {
  RegisterAgentSchema,
} from "@repo/shared";
import { useCheckUniqueInfo } from "@/hooks/agents/useAgent";

type Props = {
  register: UseFormRegister<RegisterAgentSchema>;

  errors: FieldErrors<RegisterAgentSchema>;

  trigger: UseFormTrigger<RegisterAgentSchema>;

  getValues:
  UseFormGetValues<RegisterAgentSchema>;

  setHighestStep: (
    step:
      | "personal-details"
      | "level-branch"
      | "final-assessment"
  ) => void;

  setActiveStep: (
    step:
      | "personal-details"
      | "level-branch"
      | "final-assessment"
  ) => void;
};

export default function PersonalDetailsStep({
  register,
  errors,
  trigger,
  getValues,
  setHighestStep,
  setActiveStep,
}: Props) {

  const checkUniqueMutation =
  useCheckUniqueInfo();

  return (
    <div className="flex flex-col gap-custom-32">

              <h1 className="text-mdHeader font-bold">
                Personal Details
              </h1>
              <div className="grid
                      grid-cols-1
                      md:grid-cols-2
                      lg:grid-cols-3
                      gap-x-custom-24
                      gap-y-custom-16
                      w-full items-end">
                
                              {/* AGENT NAME */}
                              <div className="relative flex flex-col gap-2 w-full">
                                <h6 className="text-neutralPrimary text-body">Agent Name</h6>
                                <input
                                  {...register(
                                    "agentName"
                                  )}
                                  
                                  className="
                                    border
                                    border-neutralPrimary
                                    rounded-lg
                                    px-4 py-3
                                    capitalize
                                    w-full
                                  "
                                />
                
                                {errors.agentName && (
                                  <p className="
                                    absolute
                                    -bottom-6
                                    left-0
                                    text-negative
                                    text-sm
                                  ">
                                    {
                                      errors
                                        .agentName
                                        .message
                                    }
                                  </p>
                                )}
                              </div>
                
                                {/* GENDER */}
                              <div className="relative flex flex-col gap-2 w-full">
                                
                                <select
                                  {...register(
                                    "agentGender"
                                  )}
                                  className="
                                    border
                                    border-neutralPrimary
                                    rounded-lg
                                    px-custom-8 py-3.5
                                  "
                                >
                                  <option value="">
                                    Select Gender
                                  </option>
                
                                  <option value="Male">
                                    Male
                                  </option>
                
                                  <option value="Female">
                                    Female
                                  </option>
                                </select>
                
                                {errors.agentGender && (
                                  <p className="
                                      absolute
                                      -bottom-6
                                      left-0
                                      text-negative
                                      text-sm
                                    ">
                                    {
                                      errors
                                        .agentGender
                                        .message
                                    }
                                  </p>
                                )}
                              </div>
                
                              {/* AGE */}
                            <div className="relative flex flex-col gap-2 w-full
                              md:col-span-2
                              lg:col-span-1">
                                <h6 className="text-neutralPrimary text-body">Date of Birth</h6>
                                <input
                                    type="date"
                                    {...register(
                                      "dateBirth",
                                      {
                                        valueAsDate: true,
                                      }
                                    )}
                                    className="
                                      border
                                      border-neutralPrimary
                                      rounded-lg
                                      px-4 py-3
                                      bg-white
                                      w-full
                                    "
                                  />
                
                                {errors.dateBirth && (
                                  <p className="
                                      absolute
                                      -bottom-6
                                      left-0
                                      text-negative
                                      text-sm
                                    ">
                                    {
                                      errors
                                        .dateBirth
                                        .message
                                    }
                                  </p>
                                )}
                              </div>
              </div>

              
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-custom-24 gap-y-custom-16 items-center justify-start w-full item-end">
                      {/* USERNAME */}
                    <div className=" flex flex-col gap-2 w-full col-span-1">
                      <h6 className="text-neutralPrimary text-body">Set Username</h6>
                      <input
                        {...register(
                          "username"
                        )}
                        placeholder="Username"
                        className="
                          border
                          border-neutralPrimary
                          rounded-lg
                          px-4 py-3
                        
                        "
                      />

                      {errors.username && (
                        <p className="text-negative text-sm">
                          {
                            errors
                              .username
                              .message
                          }
                        </p>
                      )}
                    </div>

                                          {/* CONTACT */}
                      <div className="relative flex flex-col gap-2 w-full
                        md:col-span-2
                        lg:col-span-1">
                        <h6 className="text-neutralPrimary text-body">Primary Contact Number</h6>
                        <input
                          {...register(
                            "agentTel"
                          )}
                  
                          className="
                            border
                            border-neutralPrimary
                            rounded-lg
                            px-4 py-3
                          "
                        />
                        {errors.agentTel && (
                          <p className=" absolute
                              -bottom-6
                              left-0
                              text-negative
                              text-sm">
                            {
                              errors
                                .agentTel
                                .message
                            }
                          </p>
                        )}
                      </div>


                      <div className="relative flex flex-col gap-2 w-full
                        md:col-span-2
                        lg:col-span-1">
                        <h6 className="text-neutralPrimary text-body">Secondary Contact Number</h6>
                        <input
                          {...register(
                            "agentSecTel"
                          )}
                  
                          className="
                            border
                            border-neutralPrimary
                            rounded-lg
                            px-4 py-3
                          "
                        />
                        {errors.agentSecTel && (
                          <p className=" absolute
                              -bottom-6
                              left-0
                              text-negative
                              text-sm">
                            {
                              errors
                                .agentSecTel
                                .message
                            }
                          </p>
                        )}
                      </div>

                   
            </div>

              <div className="grid
                      grid-cols-1
                      md:grid-cols-2
                      lg:grid-cols-3
                      gap-x-custom-24
                      gap-y-custom-16
                      w-full items-end">
                      {/* ADDRESS */}
                      <div className="relative flex flex-col gap-2 col-span-2">
                        <h6 className="text-neutralPrimary text-body">Address</h6>
                        <input
                          {...register(
                            "agentAdd"
                          )}
                          
                          className="
                          
                            border
                            border-neutralPrimary
                            rounded-lg
                            px-4 py-3
                          "
                        />
                        {errors.agentAdd && (
                          <p className="absolute
                              -bottom-6
                              left-0 
                              text-negative 
                              text-sm">
                            {
                              errors.agentAdd
                                .message
                            }
                          </p>
                        )}
                      </div>
                      {/* EMAIL */}
                      <div className="relative flex flex-col gap-2">
                        <h6 className="text-neutralPrimary text-body">Email</h6>
                        <input
                          {...register(
                            "email"
                          )}
                          
                          className="
                            border
                            border-neutralPrimary
                            rounded-lg
                            px-4 py-3
                          "
                        />
                        {errors.email && (
                          <p className="
                              absolute
                              -bottom-6
                              left-0
                              text-negative
                              text-sm
                            ">
                            {
                              errors.email
                                .message
                            }
                          </p>
                        )}
                      </div>

            </div>


          <div className="sticky bottom-0 bg-neutralLight p-custom-16 rounded-lg w-full flex justify-end">
              <button
                onClick={async () => {

                const valid =
                  await trigger([
                    "agentName",
                    "agentGender",
                    "dateBirth",
                    "email",
                    "agentAdd",
                    "agentTel",
                    "username",
                  ]);

                if (!valid) return;

                try {

                  const result =
                    await checkUniqueMutation.mutateAsync({
                      username:
                        getValues("username"),

                      email:
                        getValues("email"),

                      telephone:
                        getValues("agentTel"),
                    });

                  if (result.usernameExists) {

                    SweetAlert.errorAlert(
                      "Username Exists",
                      "Username already exists"
                    );

                    return;
                  }

                  if (result.emailExists) {

                    SweetAlert.errorAlert(
                      "Email Exists",
                      "Email already exists"
                    );

                    return;
                  }

                  if (result.telephoneExists) {

                    SweetAlert.errorAlert(
                      "Contact Exists",
                      "Contact number already exists"
                    );

                    return;
                  }

                  setHighestStep(
                    "level-branch"
                  );

                  setActiveStep(
                    "level-branch"
                  );

                } catch (error) {

                  console.log(error);

                  SweetAlert.errorAlert(
                    "Validation Failed",
                    "Failed to validate user information"
                  );
                }
              }}
                  className="
                    px-custom-32 py-custom-8
                    bg-positive
                    text-white
                    text-mdHeader
                    rounded-lg
                    inline-flex
                    gap-x-custom-16
                    w-fit
                    items-center
                    cursor-pointer
                    hover:scale-105
                    duration-150
                    ease-in-out
                  "
                >
                 Continue <ArrowBigRight/>
              </button>
            </div>

          </div>
  );
}