import { Trash2 } from "lucide-react";

type Props = {
  group: any;
  onDelete: (id: number) => void;
};

export default function GroupItem({ group, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between
                    border rounded-md px-3 py-2
                    bg-gray-50 hover:bg-gray-100 transition">

      <span className="text-sm font-medium text-gray-700">
        {group.name}
      </span>

      <button
        onClick={() => onDelete(group.id)}
        className="text-xs text-red-500 hover:underline flex items-center gap-1"
      >
        <Trash2 size={12} />
        Delete
      </button>

    </div>
  );
}