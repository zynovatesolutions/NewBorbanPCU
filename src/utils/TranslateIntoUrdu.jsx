export async function translateText(text, targetLang = "ur") {
  const response = await fetch("https://libretranslate.com/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "en",
      target: targetLang,
      format: "text",
    }),
  });
  const data = await response.json();
  console.log(data);
  return "zain";
}
