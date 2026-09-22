import { demoDownloadPath, findDemoById } from "../../config/demos";

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})(.*)$/;
const BLOCK_OPEN = /^(\s*)(:{2,})([a-zA-Z][\w-]*)(\{(.*)\})?\s*$/;
const BLOCK_CLOSE = /^(\s*)(:{2,})\s*$/;
const SLOT_LINE = /^\s*#([a-zA-Z][\w-]*)\s*$/;
const YAML_FENCE = /^\s*---\s*$/;
const DOC_FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const CALLOUT_LABELS: Record<string, string> = {
  note: "注意",
  tip: "提示",
  warning: "警告",
  caution: "小心",
  important: "重要",
};

export type CommonMarkdownOptions = {
  /** 站点根地址，如 https://chenyiren.top。传入后会把 /android/... 写成远程文章链接 */
  siteUrl?: string;
};

/**
 * 把 Docus / MDC 源文转成常见 Markdown：
 * 提示框 → 引用，步骤 / 手风琴 → 标题，卡片 → 列表，代码组 → 连续代码块。
 */
export function mdcToCommonMarkdown(
  source: string,
  options: CommonMarkdownOptions = {},
): string {
  const normalized = source.replace(/\r\n/g, "\n");
  const { title, description, links, body } = splitDocFrontmatter(normalized);
  const transformed = transformText(body).trim();

  const parts: string[] = [];
  if (title) parts.push(`# ${title}`);
  if (description) parts.push(`> ${description}`);
  if (transformed) parts.push(transformed);
  if (links.length) {
    parts.push(
      `## 相关链接\n\n${links.map((link) => `- [${link.label}](${link.to})`).join("\n")}`,
    );
  }

  const markdown = collapseBlankLines(parts.join("\n\n")) + "\n";
  return rewriteSiteLinks(markdown, options.siteUrl);
}

function transformText(text: string): string {
  return collapseBlankLines(transformLines(text.split("\n")).join("\n"));
}

function transformLines(lines: string[]): string[] {
  const out: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const fence = matchFenceOpen(lines[index] ?? "");
    if (fence) {
      const [count, block] = takeFence(lines, index, fence);
      out.push(...transformFence(block));
      index += count;
      continue;
    }

    const open = matchBlockOpen(lines[index] ?? "");
    if (open) {
      const [count, block] = takeMdcBlock(lines, index, open);
      out.push(...transformMdcBlock(block));
      index += count;
      continue;
    }

    out.push(lines[index] ?? "");
    index += 1;
  }

  return out;
}

function matchFenceOpen(line: string) {
  const match = line.match(FENCE_OPEN);
  if (!match) return null;
  return {
    indent: match[1] ?? "",
    marker: match[2] ?? "```",
    info: (match[3] ?? "").trim(),
  };
}

function takeFence(
  lines: string[],
  start: number,
  open: { indent: string; marker: string; info: string },
): [number, { info: string; body: string[] }] {
  const body: string[] = [];
  let index = start + 1;
  const close = new RegExp(`^\\s*${open.marker[0]}{${open.marker.length},}\\s*$`);

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (close.test(line)) {
      return [index - start + 1, { info: open.info, body }];
    }
    body.push(line);
    index += 1;
  }

  return [index - start, { info: open.info, body }];
}

function transformFence(block: { info: string; body: string[] }): string[] {
  const infoMatch = block.info.match(/^(\w*)\s*(?:\[([^\]]+)\])?\s*(.*)$/);
  const language = infoMatch?.[1] ?? "";
  const filename = infoMatch?.[2]?.trim();
  const extra = infoMatch?.[3]?.trim();
  const info = [language, extra].filter(Boolean).join(" ");
  const fence = ["```" + info, ...block.body, "```"];
  if (filename) {
    return [`**\`${filename}\`**`, "", ...fence];
  }
  return fence;
}

function matchBlockOpen(line: string) {
  const match = line.match(BLOCK_OPEN);
  if (!match) return null;
  return {
    colons: match[2] ?? "::",
    name: match[3] ?? "",
    attrs: parseAttrs(match[5] ?? ""),
  };
}

function matchBlockClose(line: string, colons: string) {
  const match = line.match(BLOCK_CLOSE);
  return Boolean(match && match[2] === colons);
}

function takeMdcBlock(
  lines: string[],
  start: number,
  open: { colons: string; name: string; attrs: Record<string, string> },
): [number, { name: string; attrs: Record<string, string>; inner: string }] {
  const inner: string[] = [];
  let index = start + 1;

  while (index < lines.length) {
    if (matchBlockClose(lines[index] ?? "", open.colons)) {
      return [
        index - start + 1,
        { name: open.name, attrs: open.attrs, inner: inner.join("\n") },
      ];
    }
    inner.push(lines[index] ?? "");
    index += 1;
  }

  return [index - start, { name: open.name, attrs: open.attrs, inner: inner.join("\n") }];
}

const UNWRAP_COMPONENTS = new Set([
  "steps",
  "accordion",
  "code-group",
  "tabs",
  "u-page-section",
  "u-page-grid",
  "u-page-hero",
  "u-page-cta",
]);

function transformMdcBlock(block: {
  name: string;
  attrs: Record<string, string>;
  inner: string;
}): string[] {
  // section / grid 等容器先原样下钻，避免把子组件的 #title 当成自己的 slot
  if (UNWRAP_COMPONENTS.has(block.name)) {
    return [transformText(block.inner)];
  }

  const parsed = parseBlockInner(block.inner);
  const props = { ...block.attrs, ...parsed.props };
  const body = transformText(parsed.body);
  const slots = Object.fromEntries(
    Object.entries(parsed.slots).map(([key, value]) => [key, transformText(value)]),
  );

  switch (block.name) {
    case "note":
    case "tip":
    case "warning":
    case "caution":
    case "important":
      return [toBlockquote(props.title || CALLOUT_LABELS[block.name] || block.name, body)];
    case "accordion-item":
    case "tabs-item": {
      const label = props.label || slots.title;
      return [joinParts(label ? `### ${label}` : "", body)];
    }
    case "demo-download":
      return [formatDemoDownload(props)];
    case "u-page-card":
    case "page-card":
      return [formatPageCard(props, slots, body)];
    default:
      if (block.inner.split("\n").some((line) => matchBlockOpen(line))) {
        return [transformText(block.inner)];
      }
      return [joinParts(slots.title && `### ${slots.title}`, slots.description, body)];
  }
}

function parseBlockInner(inner: string): {
  props: Record<string, string>;
  slots: Record<string, string>;
  body: string;
} {
  const { props, rest } = extractYaml(inner);
  const { slots, body } = extractSlots(rest);
  return { props, slots, body };
}

function extractYaml(text: string): { props: Record<string, string>; rest: string } {
  const lines = text.split("\n");
  let index = 0;
  while (index < lines.length && lines[index]?.trim() === "") index += 1;
  if (!lines[index] || !YAML_FENCE.test(lines[index] ?? "")) {
    return { props: {}, rest: text };
  }

  const yaml: string[] = [];
  index += 1;
  while (index < lines.length && !YAML_FENCE.test(lines[index] ?? "")) {
    yaml.push(lines[index] ?? "");
    index += 1;
  }
  if (index >= lines.length) {
    return { props: {}, rest: text };
  }

  return {
    props: parseYaml(yaml.join("\n")),
    rest: lines.slice(index + 1).join("\n"),
  };
}

function extractSlots(text: string): { slots: Record<string, string>; body: string } {
  const slots: Record<string, string[]> = {};
  const body: string[] = [];
  let current: string | null = null;

  for (const line of text.split("\n")) {
    const slot = line.match(SLOT_LINE);
    if (slot?.[1]) {
      current = slot[1];
      slots[current] ??= [];
      continue;
    }
    if (current) {
      slots[current]?.push(line);
    } else {
      body.push(line);
    }
  }

  return {
    body: body.join("\n").trim(),
    slots: Object.fromEntries(
      Object.entries(slots).map(([key, lines]) => [key, lines.join("\n").trim()]),
    ),
  };
}

function toBlockquote(label: string, body: string): string {
  const content = body.trim() || label;
  const lines = content.split("\n");
  const quoted = lines.map((line) => (line.trim() ? `> ${line}` : ">"));
  if (content === label) {
    return `> **${label}**`;
  }
  return [`> **${label}**`, ">", ...quoted].join("\n");
}

function formatPageCard(
  props: Record<string, string>,
  slots: Record<string, string>,
  body: string,
): string {
  const title = (slots.title || props.title || "").trim();
  const description = (slots.description || props.description || "").trim();
  const href = (props.to || props.href || "").trim();
  const detail = joinParts(description, body);

  if (title && href) {
    return detail ? `- [${title}](${href}) — ${inlineText(detail)}` : `- [${title}](${href})`;
  }
  if (title) {
    return detail ? `- **${title}** — ${inlineText(detail)}` : `- **${title}**`;
  }
  return detail;
}

function formatDemoDownload(props: Record<string, string>): string {
  const listed = props.demo ? findDemoById(props.demo) : undefined;
  const title = props.title || listed?.title || props.demo || "示例项目";
  const description = props.description || listed?.description || "";
  const href =
    props.src ||
    (listed
      ? demoDownloadPath(listed)
      : props.filename
        ? `/downloads/${props.category || listed?.category || "other"}/${props.filename}`
        : listed?.docs || "");

  const link = href ? `[下载 ${title}](${href})` : `**${title}**`;
  return description ? `${link} — ${description}` : link;
}

function splitDocFrontmatter(source: string): {
  title?: string;
  description?: string;
  links: Array<{ label: string; to: string }>;
  body: string;
} {
  const match = source.match(DOC_FRONTMATTER);
  if (!match) {
    return { links: [], body: source };
  }

  const data = parseFrontmatter(match[1] ?? "");
  return {
    title: data.title,
    description: data.description,
    links: data.links,
    body: source.slice(match[0].length),
  };
}

function parseFrontmatter(yaml: string): {
  title?: string;
  description?: string;
  links: Array<{ label: string; to: string }>;
} {
  const title = yaml.match(/^title:\s*(.+)$/m)?.[1]?.trim();
  const description = yaml.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const links: Array<{ label: string; to: string }> = [];
  const linkBlock = yaml.match(/^links:\n((?:[ \t]+.+\n?)*)/m)?.[1] ?? "";
  const chunks = linkBlock.split(/^[ \t]+-[ \t]+/m).filter(Boolean);

  for (const chunk of chunks) {
    const label = chunk.match(/label:\s*(.+)/)?.[1]?.trim();
    const to = chunk.match(/to:\s*(.+)/)?.[1]?.trim();
    if (label && to) {
      links.push({ label: unquote(label), to: unquote(to) });
    }
  }

  return {
    title: title ? unquote(title) : undefined,
    description: description ? unquote(description) : undefined,
    links,
  };
}

function parseYaml(text: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const sep = line.indexOf(":");
    if (sep === -1) {
      props[line] = "true";
      continue;
    }
    const key = line.slice(0, sep).trim();
    const value = unquote(line.slice(sep + 1).trim());
    if (key) props[key] = value || "true";
  }
  return props;
}

function parseAttrs(raw: string): Record<string, string> {
  const props: Record<string, string> = {};
  const matches = raw.matchAll(
    /([@:\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'`]+)))?/g,
  );
  for (const match of matches) {
    const key = match[1];
    if (!key) continue;
    props[key] = match[2] ?? match[3] ?? match[4] ?? "true";
  }
  return props;
}

function joinParts(...parts: Array<string | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("\n\n");
}

function inlineText(text: string): string {
  return text.replace(/\s*\n+\s*/g, " ").trim();
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function collapseBlankLines(text: string): string {
  return text.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

/** 把站内相对路径写成远程 URL；已是协议 / 锚点 / 协议相对的保持原样 */
export function toRemoteSiteUrl(href: string, siteUrl?: string): string {
  const trimmed = href.trim();
  const base = siteUrl?.replace(/\/+$/, "");
  if (!trimmed || !base) return trimmed;
  if (/^(?:[a-z][a-z\d+\-.]*:|\/\/|#)/i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

function rewriteSiteLinks(markdown: string, siteUrl?: string): string {
  if (!siteUrl) return markdown;
  return mapOutsideFences(markdown, (chunk) =>
    chunk.replace(
      /(!?\[[^\]]*\])\((<)?([^)\s>]+)(>)?((?:\s+"[^"]*")?)\)/g,
      (_match, label: string, lt = "", href: string, gt = "", title = "") =>
        `${label}(${lt}${toRemoteSiteUrl(href, siteUrl)}${gt}${title})`,
    ),
  );
}

function mapOutsideFences(
  text: string,
  map: (chunk: string) => string,
): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const fence = matchFenceOpen(lines[index] ?? "");
    if (fence) {
      const [count] = takeFence(lines, index, fence);
      out.push(...lines.slice(index, index + count));
      index += count;
      continue;
    }
    out.push(map(lines[index] ?? ""));
    index += 1;
  }

  return out.join("\n");
}
