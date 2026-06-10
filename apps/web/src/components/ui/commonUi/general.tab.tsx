import {GeneralTabProps} from "@repo/shared";

export default function AppsTab({
    tabs,
    activeTab,
    changeTab,
}: GeneralTabProps) {
    return (
        <ul className="w-full flex items-center justify-start gap-custom-32 border-b-2 border-neutralMed text-body flex-wrap">
            {tabs.map(({ key, label, icon: Icon }) => (
                <li
                    key={key}
                    onClick={() => changeTab(key)}
                    className={`
                        inline-flex items-center gap-4 justify-start
                        px-custom-24 py-2
                        cursor-pointer
                        transition-all duration-200

                        ${
                            activeTab === key
                                ? "border-b-2 border-neutralPrimary text-mainPrimary font-semibold"
                                : "text-neutralPrimary hover:text-mainPrimary"
                        }
                    `}
                >
                    <Icon className="w-4 h-4" />

                    <span>{label}</span>
                </li>
            ))}
        </ul>
    );
}