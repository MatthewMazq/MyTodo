import { writeFile } from "fs/promises";
import { join } from "path";

const OUTPUT_DIR = join(process.cwd(), "output");

export async function saveReport(content: string, date: Date): Promise<string> {
  const dateStr = date.toISOString().split("T")[0];
  const filename = `${dateStr}.md`;
  const filepath = join(OUTPUT_DIR, filename);

  await writeFile(filepath, content, "utf-8");

  return filepath;
}
