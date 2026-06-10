const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateRandomToken(
  length: number = 8
) {
  let result = "";

  for (let i = 0; i < length; i++) {
    result +=
      CHARACTERS[
        Math.floor(
          Math.random() *
            CHARACTERS.length
        )
      ];
  }

  return result;
}

function generateChecksum(
  value: string
) {
  let total = 0;

  for (let i = 0; i < value.length; i++) {
    total += value.charCodeAt(i);
  }

  return (
    total % 9999
  ).toString().padStart(4, "0");
}

export function generateAgentQR() {
  const token =
    generateRandomToken(8);

  const baseString = `JGC-AGENT-${token}`;

  const checksum =
    generateChecksum(baseString);

  return `${baseString}-${checksum}`;
}


export const generateUncodedAgentCode = () => {
    const token =
    generateRandomToken(8);
    const baseString = `JGC-UNC-${token}`;
    const checksum =
    generateChecksum(baseString);

    return `${baseString}-${checksum}`;
};