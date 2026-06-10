import {ModuleHeaderProps} from "@repo/shared";


export default function ModuleHeader({
    title,
    subtitle,
    search,
    setSearch,
    setPage,
}: ModuleHeaderProps) {
    return (
        <div className="flex justify-between items-end w-full">
            <h1 className="text-secondaryHeader font-bold text-mainPrimary w-full max-w-40 min-w-40">
                {title}
                <br />

                <span className="text-neutralPrimary">
                    {subtitle}
                </span>
            </h1>

            {/* Render only if search props exist */}
            {search !== undefined && setSearch && (
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);

                        if (setPage) {
                            setPage(1);
                        }
                    }}
                    className="
                        max-w-80 min-w-80 h-custom-48
                        rounded-md border border-slate-300
                        px-4 outline-none
                        focus:ring-1
                        focus:ring-mainPrimary
                        focus:border-mainPrimary
                        transition shadow-sm
                    "
                />
            )}
        </div>
    );
}