type EditableAgentLevel =
  | "L1"
  | "L2"
  | "L3";

export function getAllowedLevelOptions(
  originalLevel: EditableAgentLevel
): EditableAgentLevel[] {
  switch (originalLevel) {
    case "L1":
      return ["L1"];

    case "L2":
      return ["L2", "L1"];

    case "L3":
      return ["L3", "L2"];

    default:
      return [];
  }
}