const MYMEMORY_API = "https://api.mymemory.translated.net/get";
const MAX_TEXT_LENGTH = 450;

interface MyMemoryResponse {
  responseStatus: number;
  responseData: {
    translatedText: string;
  };
}

export async function translateToChinese(text: string): Promise<string> {
  if (!text || text.length === 0) return text;

  // 如果文本太长，分段翻译
  if (text.length > MAX_TEXT_LENGTH) {
    const parts = splitText(text, MAX_TEXT_LENGTH);
    const translatedParts = await Promise.all(parts.map(part => translateSingle(part)));
    return translatedParts.join("");
  }

  return translateSingle(text);
}

async function translateSingle(text: string): Promise<string> {
  if (!text || text.length === 0) return text;

  try {
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=en|zh`;
    const response = await fetch(url);

    if (!response.ok) {
      return text;
    }

    const data: MyMemoryResponse = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }

    return text;
  } catch {
    return text;
  }
}

function splitText(text: string, maxLength: number): string[] {
  const parts: string[] = [];
  const sentences = text.match(/[^.!?。！？]+[.!?。！？]*/g) || [text];

  let currentPart = "";
  for (const sentence of sentences) {
    if ((currentPart + sentence).length > maxLength && currentPart.length > 0) {
      parts.push(currentPart.trim());
      currentPart = sentence;
    } else {
      currentPart += sentence;
    }
  }

  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  return parts;
}
