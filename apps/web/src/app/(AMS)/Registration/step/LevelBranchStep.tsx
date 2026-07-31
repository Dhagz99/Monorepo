"use client";

import {
  ArrowBigRight,
  Check,
} from "lucide-react";

import SweetAlert from "@/components/modal/Swal";

import {
  RegisterAgentSchema,
  AgentSearchResult,
  BranchSearchResult,
  AgentLevel
} from "@repo/shared";

import {
  FieldErrors,
  UseFormTrigger,
  UseFormSetValue,
  Control,
} from "react-hook-form";
import { useMemo,useState } from "react";
import { useSearchAgents, useSearchBranches } from "@/hooks/agents/useAgent";
import {generateAgentQR, generateUncodedAgentCode} from "../utils/GeneratedAgentQR";
import { useAuth } from "@/components/context/UserContext";

type REGISTRATION_STEP =
  | "personal-details"
  | "level-branch"
  | "final-assessment";

type Props = {
  control: Control<RegisterAgentSchema>;
  errors: FieldErrors<RegisterAgentSchema>;
  trigger: UseFormTrigger<RegisterAgentSchema>;

  setValue: UseFormSetValue<RegisterAgentSchema>;

  setHighestStep: (
    step: REGISTRATION_STEP
  ) => void;

  setActiveStep: (
    step: REGISTRATION_STEP
  ) => void;
};

export default function LevelBranchStep({
  trigger,
  setValue,
  setHighestStep,
  setActiveStep,
}: Props) {
    

    const [uplineType, setUplineType] =
    useState<
        "with-upline" |
        "without-upline"
    >("with-upline");


    const [
    manualLevelType,
    setManualLevelType,
    ] = useState<"L1" | "L2" | "L3">("L1");

    const [searchUpline, setSearchUpline] = useState ("");

    const [selectedAgent, setSelectedAgent] = useState<AgentSearchResult | null>(null);

    const [
    showDropdown,
    setShowDropdown,
    ] = useState(false);


    const {
    data: agents = [],
    } = useSearchAgents({
    search: searchUpline
    });

    const uplineLevel = selectedAgent?.level as
    | AgentLevel
    | undefined;


    /* =========================================
    DISABLED REASON
    ========================================= */
    const getLevelDisabledReason = (
    level: AgentLevel
    ): string | null => {

    // Without an upline, all levels can be selected manually.
    if (uplineType === "without-upline") {
        if (level === "L2") {
        return "An L2 agent requires an L1 upline.";
        }

        if (level === "L3") {
        return "An L3 agent requires an L2 upline.";
        }

        return null;
    }

    // An agent with an upline can never be L1.
    if (level === "L1") {
        return "Level 1 agents cannot have an upline.";
    }

    // Wait until an upline has been selected.
    if (!selectedAgent || !uplineLevel) {
        return "Please select an upline agent first.";
    }

    // L1 upline can only register an L2 downline.
    if (uplineLevel === "L1") {
        if (level === "L3") {
        return "An L1 upline can only register an L2 agent.";
        }

        return null;
    }

    // L2 upline can only register an L3 downline.
    if (uplineLevel === "L2") {
        if (level === "L2") {
        return "An L2 upline can only register an L3 agent.";
        }

        return null;
    }

    return "The selected upline has an invalid level.";
    };

    /* =========================================
    DISABLED CHECK
    ========================================= */
   const isLevelDisabled = (
    level: AgentLevel
    ): boolean => {
    return getLevelDisabledReason(level) !== null;
    };



    /* =========================================
    FINAL SELECTED LEVEL
    ========================================= */
    const selectedAgentLevel =
    useMemo<AgentLevel | undefined>(() => {
        if (uplineType === "without-upline") {
        return manualLevelType;
        }

        if (uplineLevel === "L1") {
        return "L2";
        }

        if (uplineLevel === "L2") {
        return "L3";
        }

        return undefined;
    }, [
        uplineType,
        uplineLevel,
        manualLevelType,
    ]);



    return (
        <div className="relative flex flex-col gap-5">

        <h1 className="text-mdHeader font-bold">
            Level & Branch Assignment
        </h1>

        <div className="flex flex-col gap-y-custom-16">

            {/* UPLINE TYPE */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-custom-24 gap-y-custom-24 items-end">
                
                <div className="relative flex flex-col gap-2">

                    <h6 className="text-neutralPrimary text-body">
                        Select Registration Type
                    </h6>
                    <div className="flex gap-x-custom-16 border-2 border-neutralMed w-full px-custom-24 py-3 rounded-md">
                        {/* WITH UPLINE */}
                        <label className="inline-flex items-center gap-3 cursor-pointer">
                        <button
                            type="button"
                            onClick={() =>
                            setUplineType(
                                "with-upline"
                            )
                            }
                            className="
                            w-5
                            h-5
                            rounded-full
                            border-2
                            border-positive
                            flex
                            items-center
                            justify-center
                            "
                        >
                            {uplineType ===
                            "with-upline" && (
                            <Check
                                className="
                                w-3
                                h-3
                                text-positive
                                "
                            />
                            )}
                        </button>
                        <span>
                            With Upline
                        </span>
                        </label>
                        {/* WITHOUT UPLINE */}
                        <label className="inline-flex items-center gap-3 cursor-pointer">
                        <button
                            type="button"
                            onClick={() => {

                            setUplineType(
                                "without-upline"
                            );

                 
                            setSearchUpline("");

                            setShowDropdown(false);

                            setSelectedAgent(null);

                            setValue(
                                "parentAgentName",
                                ""
                            );

                            setValue(
                                "parentAgentId",
                                ""
                            );

                            setValue(
                                "uplineLevel",
                                ""
                            );
                            }}
                                className="
                            w-5
                            h-5
                            rounded-full
                            border-2
                            border-positive
                            flex
                            items-center
                            justify-center
                            "
                        >
                            {uplineType ===
                            "without-upline" && (
                            <Check
                                className="
                                w-3
                                h-3
                                text-positive
                                "
                            />
                            )}
                        </button>
                        <span>
                            Without Upline
                        </span>
                        </label>
                    </div>
                </div>

     

         </div>


        {uplineType ===
                "with-upline" && (

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-custom-24 gap-y-custom-16 items-center justify-start w-full item-end my-custom-16">

                {/* SEARCH */}
                <div className="relative flex flex-col gap-2">

                    <h6 className="text-neutralPrimary text-body">
                    Search Upline Agent Name 
                    </h6>

                    <input
                    type="search"
                    value={searchUpline}
                    onChange={(e) => {

                        setSearchUpline(
                        e.target.value
                        );

                        setShowDropdown(true);
                    }}
                    className="
                        border
                        border-neutralPrimary
                        rounded-lg
                        px-4 py-3
                        w-full
                    "
                    />

                    {/* DROPDOWN */}
                    {showDropdown &&
                    agents.length > 0 &&
                    searchUpline && (

                    <div
                        className="
                        absolute
                        top-full
                        left-0
                        w-full
                        bg-white
                        border
                        border-neutralMed
                        rounded-lg
                        shadow-md
                        z-50
                        mt-1
                        max-h-60
                        overflow-y-auto
                        "
                    >

                        {agents.map((agent) => (

                        <button
                            key={agent.id}
                            type="button"
                            onClick={() => {

                            setSelectedAgent(
                            agent
                            );

                            setSearchUpline(
                            agent.fullName
                            );

                            setValue(
                            "parentAgentName",
                            agent.fullName
                            );

                            setValue(
                            "parentAgentId",
                            agent.id
                            );

                            setValue(
                            "uplineLevel",
                            agent.level
                            );

                            setShowDropdown(false);
                            }}
                            className="
                            w-full
                            text-left
                            px-4
                            py-3
                            hover:bg-neutralLight
                            "
                        >

                            <div className="flex flex-col">

                            <span className="font-semibold">
                                {agent.fullName} 
                            </span>

                            <span className="text-xs text-neutralPrimary">
                                {agent.level}
                            </span>

                            </div>

                        </button>

                        ))}

                    </div>
                    )}

                </div>


                {/* LEVEL */}
                <div className="flex flex-col gap-2">

                    <h6 className="text-neutralPrimary text-body">
                    Upline Agent Level
                    </h6>

                    <input
                    disabled
                    readOnly
                    value={
                        selectedAgent?.level || ""
                    }
                    className="
                        border
                        border-neutralPrimary
                        rounded-lg
                        px-4 py-3

                        bg-neutralLight
                        opacity-70
                        cursor-not-allowed
                    "
                    />

                </div>

                {/* STATUS */}
                <div className="flex flex-col gap-2">

                    <h6 className="text-neutralPrimary text-body">
                    Upline Agent Status
                    </h6>

                    <input
                    disabled
                    readOnly
                    value={
                        selectedAgent?.status || ""
                    }
                    className="
                        border
                        border-neutralPrimary
                        rounded-lg
                        px-4 py-3

                        bg-neutralLight
                        opacity-70
                        cursor-not-allowed
                    "
                    />

                </div>

                </div>
            )}

            {/* LEVEL SELECTION */}
            <ul className="w-full flex justify-between items-center border-y border-y-neutralMed mb-custom-16">

                {/* L1 */}
                <li className="inline-flex py-custom-16 gap-custom-16 items-center justify-center w-full">

                <label
                    className="
                    relative
                    inline-flex
                    items-center
                    gap-3
                    group
                    "
                >

                    <button
                    type="button"
                    onClick={() => {

                        if (
                        isLevelDisabled("L1")
                        ) return;

                        setManualLevelType("L1");

                    }}
                    className={`
                        w-5
                        h-5
                        rounded-full
                        border-2
                        border-positive
                        flex
                        items-center
                        justify-center

                        ${
                        isLevelDisabled("L1")
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }
                    `}
                    >

                    {selectedAgentLevel ===
                        "L1" && (
                        <Check className="w-3 h-3 text-positive" />
                    )}

                    </button>

                    <span>
                    Level 1
                    </span>

                    {isLevelDisabled("L1") && (
                    <div
                        className="
                        absolute
                        -top-14
                        left-1/2
                        -translate-x-1/2
                        whitespace-nowrap
                        bg-darkPrimary
                        text-white
                        text-xs
                        px-3
                        py-2
                        rounded-lg
                        opacity-0
                        group-hover:opacity-100
                        transition
                        pointer-events-none
                        z-50
                        shadow-lg
                        "
                    >

                        {getLevelDisabledReason("L1")}

                    </div>
                    )}

                </label>

                </li>

                {/* L2 */}
                <li className="inline-flex py-custom-16 gap-custom-16 items-center justify-center w-full border-x border-x-neutralMed">

                    <label
                        className="
                        relative
                        inline-flex
                        items-center
                        gap-3
                        group
                        "
                    >

                        <button
                        type="button"
                        onClick={() => {

                            if (
                            isLevelDisabled("L2")
                            ) return;

                            setManualLevelType("L2");

                        }}
                        className={`
                            w-5
                            h-5
                            rounded-full
                            border-2
                            border-positive
                            flex
                            items-center
                            justify-center

                            ${
                            isLevelDisabled("L2")
                                ? "opacity-40 cursor-not-allowed"
                                : ""
                            }
                        `}
                        >

                        {selectedAgentLevel ===
                            "L2" && (
                            <Check className="w-3 h-3 text-positive" />
                        )}

                        </button>

                        <span>
                        Level 2
                        </span>

                        {isLevelDisabled("L2") && (
                        <div
                            className="
                            absolute
                            -top-14
                            left-1/2
                            -translate-x-1/2
                            whitespace-nowrap
                            bg-darkPrimary
                            text-white
                            text-xs
                            px-3
                            py-2
                            rounded-lg
                            opacity-0
                            group-hover:opacity-100
                            transition
                            pointer-events-none
                            z-50
                            shadow-lg
                            "
                        >

                            {getLevelDisabledReason("L2")}

                        </div>
                        )}

                    </label>

                    </li>

                {/* L3 */}
                <li className="inline-flex py-custom-16 gap-custom-16 items-center justify-center w-full">

                    <label
                        className="
                        relative
                        inline-flex
                        items-center
                        gap-3
                        group
                        "
                    >

                        <button
                        type="button"
                        onClick={() => {

                            if (
                            isLevelDisabled("L3")
                            ) return;

                            setManualLevelType("L3");

                        }}
                        className={`
                            w-5
                            h-5
                            rounded-full
                            border-2
                            border-positive
                            flex
                            items-center
                            justify-center

                            ${
                            isLevelDisabled("L3")
                                ? "opacity-40 cursor-not-allowed"
                                : ""
                            }
                        `}
                        >

                        {selectedAgentLevel ===
                            "L3" && (
                            <Check className="w-3 h-3 text-positive" />
                        )}

                        </button>

                        <span>
                        Level 3
                        </span>

                        {isLevelDisabled("L3") && (
                        <div
                            className="
                            absolute
                            -top-14
                            left-1/2
                            -translate-x-1/2
                            whitespace-nowrap
                            bg-darkPrimary
                            text-white
                            text-xs
                            px-3
                            py-2
                            rounded-lg
                            opacity-0
                            group-hover:opacity-100
                            transition
                            pointer-events-none
                            z-50
                            shadow-lg
                            "
                        >

                            {getLevelDisabledReason("L3")}

                        </div>
                        )}

                    </label>

                    </li>

            </ul>

            
    </div>





        <div className="sticky bottom-0 bg-neutralLight p-custom-16 rounded-lg w-full flex justify-end">

            <button
                onClick={async () => {

                if (!selectedAgentLevel) {

                    SweetAlert.errorAlert(
                    "Level Required",
                    "Please select an agent level."
                    );

                    return;
                }

                const generatedQR =
                    generateAgentQR();

                setValue(
                    "agentQrCode",
                    generatedQR
                    );


                setValue(
                    "selectedAgentLevel",
                    selectedAgentLevel
                );

                const valid =
                    await trigger([
                    "branches",
                    "parentAgentId",
                    "uplineLevel",
                    ]);

                if (!valid) {
                    return;
                }

                setHighestStep(
                    "final-assessment"
                );

                setActiveStep(
                    "final-assessment"
                );
                }}
            className="
                px-custom-32
                py-custom-8
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
            Continue

            <ArrowBigRight />
            </button>

        </div>

        </div>
    );
}