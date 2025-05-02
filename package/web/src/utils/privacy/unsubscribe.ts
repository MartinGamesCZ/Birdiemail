const unsub_definition: {
  keyword: [string, number][];
} = {
  keyword: [
    // EN
    ["unsubscribe", 1],
    ["opt-out", 1],
    ["remove", 0.2],

    // CS
    ["odhlásit", 1],
    ["zrušit odběr", 1],
    ["zrušit", 0.2],
    ["odstranit", 0.2],
    ["odběr", 0.1],
  ],
};

export function findUnsubscribeLink(html: string) {
  const dom = new DOMParser().parseFromString(html, "text/html");

  const links = dom.getElementsByTagName("a");

  let found: {
    href: string;
    weight: number;
  }[] = [];

  for (const link of links) {
    const href = link.getAttribute("href");
    if (!href) continue;

    const text = link.textContent?.toLowerCase() ?? "";
    const title = link.getAttribute("title")?.toLowerCase() ?? "";

    const titleMatch = unsub_definition.keyword.filter((keyword) =>
      title.includes(keyword[0].toLowerCase())
    );
    const textMatch = unsub_definition.keyword.filter((keyword) =>
      text.includes(keyword[0].toLowerCase())
    );

    const titleScore = titleMatch.reduce((acc, keyword) => acc + keyword[1], 0);
    const textScore = textMatch.reduce((acc, keyword) => acc + keyword[1], 0);
    const score = titleScore + textScore;

    if (
      score > 0 &&
      (href.startsWith("http") ||
        href.startsWith("https") ||
        href.startsWith("//")) &&
      !found.some((f) => f.href === href)
    ) {
      found.push({
        href: href.startsWith("//") ? "https:" + href : href,
        weight: score,
      });
    }
  }

  console.log("Found unsubscribe links", found);

  return found.sort((a, b) => b.weight - a.weight)?.[0];
}
