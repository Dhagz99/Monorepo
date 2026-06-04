"use client";

import { useState } from "react";

type Props = {
  onCreate: (name: string) => void;
};

export default function CreateGroupForm({ onCreate }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    onCreate(name.trim());
    setName("");
  };

  return (
    <div className="flex items-center gap-2">

      <input
        type="text"
        placeholder="Enter group name (e.g. VISAYAS)"
        value={name}
        onChange={(e) => setName(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="border px-3 py-2 rounded-md text-sm w-64
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
      >
        + Create
      </button>

    </div>
  );
}