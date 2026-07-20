export function validateStudentIds(studentIds) {
  if (!Array.isArray(studentIds)) {
    throw new Error("studentIds must be an array.");
  }
  if (studentIds.length === 0) {
    throw new Error("studentIds cannot be empty.");
  }

  const invalidType = studentIds.find((id) => typeof id !== "string" || id.trim() === "");
  if (invalidType !== undefined) {
    throw new Error(`Invalid studentId found: ${JSON.stringify(invalidType)}`);
  }

  const uniqueIds = new Set(studentIds);
  if (uniqueIds.size !== studentIds.length) {
    throw new Error("studentIds contains duplicates.");
  }

  if (studentIds.length > 200) {
    throw new Error("Too many studentIds in a single request (max 200).");
  }

  return [...uniqueIds];
}
