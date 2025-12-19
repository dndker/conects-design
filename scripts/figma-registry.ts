import type { LocalVariable, RGBA } from "@figma/rest-api-spec";
import "dotenv/config";
import { Api as FigmaApi } from "figma-api";
import fs from "node:fs/promises";
import path from "node:path";

const FIGMA_TOKEN = process.env.FIGMA_PERSONAL_ACCESS_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

// if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
//   throw new Error("Missing FIGMA_PERSONAL_ACCESS_TOKEN or FIGMA_FILE_KEY");
// }

function rgbaToHex({ r, g, b }: RGBA) {
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

async function main() {
  if (!FIGMA_TOKEN) {
    console.warn(
      "FIGMA_PERSONAL_ACCESS_TOKEN 환경변수가 설정되지 않았습니다. 스타일 추출을 건너뜁니다."
    );
    return [];
  }

  if (!FIGMA_FILE_KEY) {
    console.warn(
      "FIGMA_FILE_KEY 환경변수가 설정되지 않았습니다. 스타일 추출을 건너뜁니다."
    );
    return [];
  }

  const api = new FigmaApi({
    personalAccessToken: FIGMA_TOKEN,
  });

  const { meta } = await api.getLocalVariables({ file_key: FIGMA_FILE_KEY });

  const colors: Record<string, string> = {};

  Object.values(meta.variables).forEach((v: LocalVariable) => {
    if (v.resolvedType !== "COLOR") return;

    const value = Object.values(v.valuesByMode)[0] as RGBA;
    if (!value) return;

    colors[v.name.replace(/\//g, ".")] = rgbaToHex(value);
  });

  const outputPath = path.resolve("docs/public/tokens/colors.json");

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(colors, null, 2));

  console.log(
    `✅ colors.json generated (${Object.keys(colors).length} tokens)`
  );
}

main();
