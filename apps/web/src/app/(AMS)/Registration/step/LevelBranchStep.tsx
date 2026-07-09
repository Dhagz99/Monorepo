"use client";

import {
  ArrowBigRight,
  Check,
} from "lucide-react";

import SweetAlert from "@/components/modal/Swal";

import {
  RegisterAgentSchema,
  AgentSearchResult,
  BranchSearchResult
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
    
    const { user } = useAuth();

    const isBranchAccount =
    user?.roles?.includes("BRANCH_ACC");

    const [uplineType, setUplineType] =
    useState<
        "with-upline" |
        "without-upline"
    >("with-upline");

    // const [accType, setAccType] = 
    // useState<
    //     "CODED" |
    //     "UNCODED"
    // >("CODED");

    const [
    manualLevelType,
    setManualLevelType,
    ] = useState<
    "L1" |
    "L2" |
    "L3"
    >();

    const [searchUpline, setSearchUpline] = useState ("");

    const [selectedAgent, setSelectedAgent] = useState<AgentSearchResult | null>(null);

    const [
    showDropdown,
    setShowDropdown,
    ] = useState(false);

    const [searchBranch, setSearchBranch] = useState ("");

    const [selectedBranches,setSelectedBranches,] = useState<BranchSearchResult[]>([]);

    const [branchDropdown, setBranchDropdown] = useState(false);

     const {
        data: branch = [],
        } = useSearchBranches({
        search: searchBranch,
        });

    const {
    data: agents = [],
    } = useSearchAgents({
    search: searchUpline,

    branchCodes:
        selectedBranches.map(
        branch => branch.branchCode
        ),
    });

    const uplineLevel =
    selectedAgent?.level;

    
    const MAX_L2_DOWNLINE = 10;

    const MAX_L3_DOWNLINE = 10;


    /* =========================================
    BRANCH SLOT CHECKER
    ========================================= */
    const hasBranchAvailableSlot = (
    level: "L1" | "L2" | "L3"
    ) => {

    if (selectedBranches.length === 0) {
        return false;
    }

    /* =========================
        L1
        BRANCH-BASED
    ========================= */
    if (level === "L1") {

        return selectedBranches.some(
        (branch) =>
            branch.capacity
            .availableL1Slots > 0
        );
    }

    

  /* =========================
     L2 / L3
     GLOBAL MLM
  ========================= */
    return true;
    };
    /* =========================================
    DISABLED REASON
    ========================================= */
    const getLevelDisabledReason = (
    level: "L1" | "L2" | "L3"
    ) => {

    /* =========================
        NO BRANCH SELECTED
    ========================= */
    if (
        selectedBranches.length === 0
    ) {
        return "Please select at least one branch.";
    }

    /* =========================
        BRANCH SLOT LIMIT
    ========================= */
    if (
        !hasBranchAvailableSlot(level)
    ) {
        return `No available ${level} slots in selected branches.`;
    }

    /* =========================
        WITHOUT UPLINE
    ========================= */
    if (
        uplineType ===
        "without-upline"
    ) {
        return null;
    }

    /* =========================
        NO UPLINE LEVEL
    ========================= */
    if (!uplineLevel) {
        return "Please select an upline agent.";
    }

    /* =========================
        UPLINE L2
        Can ONLY create L3
    ========================= */
    if (uplineLevel === "L2") {

        if (level !== "L3") {
        return "Level 2 uplines can only create Level 3 agents.";
        }

        if (
        selectedAgent
            ?.l3DownlineCount >=
        MAX_L3_DOWNLINE
        ) {
        return "Maximum Level 3 downlines reached.";
        }
    }

    /* =========================
        UPLINE L1
    ========================= */
    if (uplineLevel === "L1") {

        /* Cannot create L1 */
        if (level === "L1") {
        return "You can't have the same level as your upline.";
        }

        /* L2 LIMIT */
        if (
        level === "L2" &&
        selectedAgent
            ?.l2DownlineCount >=
        MAX_L2_DOWNLINE
        ) {
        return "Maximum Level 2 downlines reached.";
        }

        /* L3 LIMIT */
        if (
        level === "L3" 
        ) {
        return "Invalid assignment. L3 can only be assigned as a downline of L2";
        }
    }

    return null;
    };

    /* =========================================
    DISABLED CHECK
    ========================================= */
    const isLevelDisabled = (
    level: "L1" | "L2" | "L3"
    ) => {

    return !!getLevelDisabledReason(
        level
    );
    };

    /* =========================================
    FINAL SELECTED LEVEL
    ========================================= */
    const selectedAgentLevel =
    useMemo(() => {

        /* =========================
        WITHOUT UPLINE
        ========================= */
        if (
        uplineType ===
        "without-upline"
        ) {
        return manualLevelType;
        }

        /* =========================
        UPLINE L2
        ========================= */
        if (
        uplineLevel === "L2"
        ) {

        return "L3";
        }

        /* =========================
        UPLINE L1
        ========================= */
        if (
        uplineLevel === "L1"
        ) {

        /* Prevent invalid L1 */
        if (
            manualLevelType ===
            "L1"
        ) {
            return "L2";
        }

        return manualLevelType;
        }

        return manualLevelType;

    }, [
        uplineType,
        uplineLevel,
        manualLevelType,
    ]);

    const handleSelectBranch = (
    branch: BranchSearchResult
    ) => {

    const alreadyExists =
        selectedBranches.some(
        (b) =>
            b.branchCode ===
            branch.branchCode
        );

    if (alreadyExists) {
        return;
    }

    if (
        selectedBranches.length >= 2
    ) {
        return;
    }

    const updatedBranches = [
        ...selectedBranches,
        branch,
    ];

    setSelectedBranches(
        updatedBranches
    );

    setValue(
        "branches",
        updatedBranches.map(
            (branch) => ({
            branchCode:
                branch.branchCode,

            companyName:
                branch.companyName ?? undefined,
            })
        )
        );

    setSearchBranch("");

    setBranchDropdown(false);
    };
    

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

        {/* <div className="relative flex flex-col gap-2">

            <h6 className="text-neutralPrimary text-body">
               Select Account Type
            </h6>
            <div className="flex gap-x-custom-16 border-2 border-neutralMed w-full px-custom-24 py-3 rounded-md">
   
                <label className="inline-flex items-center gap-3 cursor-pointer">
                <button
                    type="button"
                    onClick={() => {

                        setAccType("CODED");

                        setValue(
                            "agentAccType",
                            "CODED"
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
                    {accType ===
                    "CODED" && (
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
                    CODED
                </span>
                </label>
   
                <label className="inline-flex items-center gap-3 cursor-pointer">
                <button
                    type="button"
                    onClick={() => {

                        setAccType("UNCODED");

                        setValue(
                            "agentAccType",
                            "UNCODED"
                        );

                        // REMOVE QR
                        setValue(
                            "agentQrCode",
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
                    {accType ===
                    "UNCODED" && (
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
                    UNCODED
                </span>
                </label>
            </div>
        </div> */}



        {/* =========================
            BRANCH SELECTOR
        ========================= */}
        <div className="relative flex flex-col gap-2 col-span-3">

            <h6 className="text-neutralPrimary text-body">
            Assign Agent Branch
            </h6>

            {/* INPUT CONTAINER */}
            <div
            className="
                flex
                flex-wrap
                items-center
                gap-2
                border
                border-neutralPrimary
                rounded-lg
                px-3
                py-2
                min-h-13
                bg-white
                focus-within:border-mainPrimary
                focus-within:border-2
            "
            >

            {/* SELECTED TAGS */}
            {selectedBranches.map(
                (branch) => (

                <div
                    key={branch.branchCode}
                    className="
                    relative
                    inline-flex
                    items-center
                    gap-2
                    bg-positive/10
                    text-positive
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    "
                >

                    <span>
                    {branch.companyName}
                    </span>

                    <button
                    type="button"
                    onClick={() => {

                    const updatedBranches =
                    selectedBranches.filter(
                        (b) =>
                        b.branchCode !==
                        branch.branchCode
                    );

                    setSelectedBranches(
                    updatedBranches
                    );

                    setValue(
                    "branches",
                    updatedBranches.map(
                        (branch) => ({
                        branchCode:
                            branch.branchCode,

                        companyName:
                            branch.companyName ?? undefined,
                        })
                    )
                    );

                    }}
                    className="
                        hover:text-negative
                    "
                    >
                    ×
                    </button>

                </div>
                )
            )}

            {selectedBranches.length >= 2 && (
            <p className="absolute -bottom-custom-24 text-xs text-negative">
                Maximum of 2 branches only.
            </p>
            )}

            {/* SEARCH INPUT */}
            <input
                type="search"
                value={searchBranch}
                disabled={
                    selectedBranches.length >= 2
                }
                onChange={(e) => {

                setSearchBranch(
                    e.target.value
                );

                setBranchDropdown(true);
                }}
                placeholder="Search Branch..."
                className="
                flex-1
                min-w-45
                outline-none
                bg-transparent
                disabled:opacity-50
                disabled:cursor-not-allowed
                "
            />

            </div>

            {/* DROPDOWN */}
            {branchDropdown &&
            branch.length > 0 &&
            searchBranch && (

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

                {branch.map((branch) => (

                <button
                    key={branch.branchCode}
                    type="button"
                    onClick={() =>
                        handleSelectBranch(branch)
                    }
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
                        {branch.companyName}
                    </span>

                    <span className="text-xs text-neutralPrimary">
                        {branch.branchCode}
                    </span>

                    </div>

                </button>
                ))}

            </div>
            )}

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



            <div
            className={`
                grid
                gap-custom-24
                ${
                selectedBranches.length === 1
                    ? "grid-cols-1"
                    : "grid-cols-1 xl:grid-cols-2"
                }
            `}
            >

            {selectedBranches.map((branch) => (

            <div
                key={branch.branchCode}
                className="
                border
                border-neutralMed
                rounded-2xl
                p-custom-24
                bg-white
                shadow-sm
                flex
                flex-col
                gap-y-custom-24
                mb-custom-16
                "
            >

                {/* HEADER */}
                <div className="flex justify-between items-start">

                <div>

                    <h3 className="font-bold text-mainPrimary">
                    {branch.companyName}
                    </h3>

                    <p className="text-sm text-neutralPrimary">
                    {branch.branchCode}
                    </p>

                </div>

                </div>

                {/* CAPACITY */}
                <div className="grid grid-cols-3 gap-4">

                {/* L1 */}
                <div
                    className="
                    bg-neutralLight
                    rounded-xl
                    p-custom-16
                    flex
                    flex-col
                    "
                >

                    <p className="text-xs text-neutralPrimary">
                    L1
                    </p>

                    <strong className="text-secondaryHeader text-mainPrimary">
                    {branch.capacity.totalL1}/10
                    </strong>

                    <span className="text-xs text-neutralPrimary">
                    Available:
                    {" "}
                    {branch.capacity.availableL1Slots}
                    </span>

                </div>

                {/* L2 */}
                <div
                    className="
                    bg-neutralLight
                    rounded-xl
                    p-custom-16
                    flex
                    flex-col
                    "
                >

                    <p className="text-xs text-neutralPrimary">
                    L2
                    </p>

                    <strong className="text-secondaryHeader text-mainPrimary">
                    {branch.capacity.totalL2}
                    </strong>

                    <span className="text-xs text-neutralPrimary">
                    Global hierarchy
                    </span>

                </div>

                {/* L3 */}
                <div
                    className="
                    bg-neutralLight
                    rounded-xl
                    p-custom-16
                    flex
                    flex-col
                    "
                >

                    <p className="text-xs text-neutralPrimary">
                    L3
                    </p>

                    <strong className="text-secondaryHeader text-mainPrimary">
                    {branch.capacity.totalL3}
                    </strong>

                    <span className="text-xs text-neutralPrimary">
                    Global hierarchy
                    </span>

                </div>

                </div>
                {/* AVAILABLE UPLINES */}
                <div className="relative flex flex-col gap-y-custom-16 max-h-100 overflow-y-auto">

                <h4 className="sticky top-0 bg-white py-custom-16 font-semibold text-mainPrimary">
                    Available Uplines
                </h4>

                {branch.availableUplines
                    .length === 0 ? (

                    <div
                    className="
                        w-full
                        border
                        border-dashed
                        border-neutralMed
                        rounded-xl
                        p-custom-24
                        text-center
                        text-neutralPrimary
                    "
                    >
                    No available uplines
                    </div>

                ) : (

                    branch.availableUplines.map(
                    (upline) => (

                        <div
                        key={upline.id}
                        className="
                            border
                            border-neutralMed
                            rounded-xl
                            p-custom-16
                            flex
                            justify-between
                            items-center
                            hover:border-mainPrimary
                            transition
                            
                        "
                        >

                        {/* LEFT */}
                        <div>

                            <p className="font-semibold">
                            {upline.fullName}
                            </p>

                            <p
                            className="
                                text-xs
                                text-neutralPrimary
                            "
                            >
                            {upline.level}
                            </p>

                        </div>

                        {/* RIGHT */}
                        <div
                            className="
                            flex
                            flex-col
                            items-end
                            text-sm
                            "
                        >

                            {upline.level ===
                            "L1" && (
                            <p>
                                L2 Vacancy:
                                {" "}
                                {
                                upline
                                    .availableL2Slots
                                }
                            </p>
                            )}

                            <p>
                            L3 Vacancy:
                            {" "}
                            {
                                upline
                                .availableL3Slots
                            }
                            </p>

                        </div>

                        </div>
                    )
                    )
                )}

                </div>

            </div>
            ))}

        </div>
            

            {/* SHOW ONLY IF WITH UPLINE */}

            

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




