// PAge HEader Typees
export interface ModuleHeaderProps {
    title: string;
    subtitle: string;

    search?: string;
    setSearch?: React.Dispatch<React.SetStateAction<string>>;
    setPage?: React.Dispatch<React.SetStateAction<number>>;
};





// Tab Typees
export interface TabItem {
    key: string;
    label: string;
    icon: React.ElementType;
};

export interface GeneralTabProps {
    tabs: TabItem[];
    activeTab: string;
    changeTab: (key: string) => void;
};

