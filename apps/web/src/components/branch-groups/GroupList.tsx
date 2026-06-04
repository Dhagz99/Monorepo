import GroupItem from "./GroupItem";

type Props = {
  groups: any[];
  onDelete: (id: number) => void;
};

export default function GroupList({ groups, onDelete }: Props) {
  if (!groups.length) {
    return (
      <div className="text-sm text-gray-400">
        No groups created yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">

      {groups.map((group) => (
        <GroupItem
          key={group.id}
          group={group}
          onDelete={onDelete}
        />
      ))}

    </div>
  );
}