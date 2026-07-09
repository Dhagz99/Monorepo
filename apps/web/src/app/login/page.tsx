

"use client";

import ResponsiveImage from "@/components/ui/ResponsiveImage";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "@repo/shared";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/UserContext";
import { useLogin } from "@/hooks/auth/useLogin";
import { toast } from "sonner";
import SweetAlert from "@/components/modal/Swal";

import axios from "axios";

interface ApiErrorResponse {
  code?: string;
  message?: string;
}



export default function LoginPage() {

    const router = useRouter();
    const { refreshUser } = useAuth();

    const { mutateAsync } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

const onSubmit = async (
  data: LoginSchema
) => {
  try {

    await mutateAsync(data);

    toast.success(
      "Login successful"
    );

    const user =
      await refreshUser();

    if (
      user?.permissions.includes(
        "PROFILE_ACCESS"
      )
    ) {
      router.replace("/Profile");
      return;
    }

    if (
      user?.permissions.includes(
        "DASHBOARD_ACCESS"
      )
    ) {
      router.replace("/");
      return;
    }

    router.replace("/unauthorized");

  } catch (error: unknown) {

  if (
    axios.isAxiosError<ApiErrorResponse>(
      error
    )
  ) {

    const code =
      error.response?.data?.code;

    switch (code) {

      case "ACCOUNT_DROPPED":
        await SweetAlert.errorAlert(
          "Account Dropped",
          "Your account has been dropped by management. Kindly coordinate with your branch for clarification and further instructions."
        );
        return;

      case "ACCOUNT_SUSPENDED":
        await SweetAlert.errorAlert(
          "Account Suspended",
          "Your account is currently under suspension. Kindly coordinate with your branch for clarification and further instructions."
        );
        return;

      case "ACCOUNT_INACTIVE":
        await SweetAlert.errorAlert(
          "Account Inactive",
          "Your account is inactive."
        );
        return;

      case "INVALID_CREDENTIALS":
        await SweetAlert.errorAlert(
          "Login Failed",
          "Invalid username or password."
        );
        return;
    }
  }

  await SweetAlert.errorAlert(
    "Error",
    "Something went wrong."
  );
}
};
  return (
    <div className="relative min-h-screen bg-white text-mainPrimary w-full flex gap-custom-16 overflow-hidden">
        <div className="w-full flex flex-col-reverse gap-y-12 lg:flex-row z-50">
            
            <div className="
              flex flex-col items-start justify-center gap-custom-32 sm:py-custom-32 px-custom-48 sm:px-custom-64
              w-full lg:w-[50%]
              py-custom-64 
              bg-mainPrimary text-white
              bg-[radial-gradient(circle_at_top_right,rgba(30,64,175,0.45),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(30,64,175,0.25),transparent_35%)]
            ">

              <ResponsiveImage
                src="/images/AMSLOGO.svg"
                alt="Logo"
                width={300}
                height={300}
                minWidth="8rem"
                maxWidth="15rem"
              />

              
              <div className="flex flex-col gap-custom-8">
                <h1 className="text-primaryHeader font-bold">
                  Manage. Track. <br></br> <span className="text-positive">Reward</span> Performance
                </h1>
                <p className="font-normal text-body">
                  A platform that boosts efficiency, prevents commission fraud, <br></br> and ensures transparent agent tracking.
                </p>
              </div>

              <div className="flex flex-col gap-custom-16">
                <Image
                  src="/images/LOGINIMAGE.svg"
                  alt="LOGINIMAGE"
                  width={40}
                  height={40}
                  priority
                  className="w-lg md:w-lg lg:w-120 h-auto"
                />
                <h6 className="text-body font-normal">
                    JAMERO GROUP OF COMPANIES
                </h6>
              </div>
            </div>


            <div className="w-full lg:w-[50%] py-custom-48 sm:py-0 flex items-center justify-center text-mainPrimary">
                
              <div className="flex flex-col items-start justify-center gap-custom-32 py-custom-32 px-custom-48 sm:px-custom-64 w-full">

                <div className="flex flex-col w-full items-center justify-center">
                  <h1 className="text-primaryHeader font-bold">WELCOME BACK</h1>
                  <p className="font-normal text-body">Please login to access the site.</p>
                </div>
                
                <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="w-full flex flex-col gap-custom-24"
                      >
                        {/* USERNAME */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            placeholder="Enter username"
                            {...register("username")}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                          {errors.username && (
                            <p className="text-red-500 text-sm mt-2">
                              {errors.username.message}
                            </p>
                          )}
                        </div>
                        {/* PASSWORD */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            placeholder="Enter password"
                            {...register("password")}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                          {errors.password && (
                            <p className="text-red-500 text-sm mt-2">
                              {errors.password.message}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <label className="flex items-center gap-2 text-mainPrimary cursor-pointer">
                            <input type="checkbox" className="rounded" />
                            Remember me
                          </label>
                          <button
                            type="button"
                            className="text-mainPrimary hover:scale-102 ease-in-out duration-100 cursor-pointer font-medium"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-12 rounded-xl bg-positive hover:bg-positive-hover transition cursor-pointer text-white font-semibold shadow-lg shadow-blue-500/20"
                        >
                          {isSubmitting ? "Signing In..." : "Sign In"}
                        </button>
                </form>
              </div>

            </div>
        </div>
    </div>
  );
}














