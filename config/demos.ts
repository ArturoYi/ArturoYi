/**
 * 文档配套示例工程目录。
 *
 * 放置 zip：
 *   public/downloads/<category>/<filename>
 *   例：public/downloads/android/hidden-dex-minidemo.zip
 * 目录页是 /demos，zip 不能放在 public/demos/，否则会挡住该路由。
 *
 * 在文档中引用：
 *   ::demo-download
 *   ---
 *   demo: hidden-dex-minidemo
 *   ---
 *   ::
 *
 * category 与栏目 slug 对齐（android / ios / flutter …），
 * 也可用栏目目录名（3.android）。新增示例：放入 zip 并在下方登记。
 * 加入 zip 后如需显示体积，重启一次 nuxt dev。
 *
 * Git LFS（.gitattributes 已跟踪 public/downloads 下的 zip）：
 *   1. 安装：brew install git-lfs
 *   2. 每个克隆一次：git lfs install
 *   3. 放入 zip 后照常 git add / commit / push，二进制走 LFS
 *   克隆后若下载卡片体积不对或 zip 打不开：git lfs pull
 *   GitHub 免费额度约 1 GB 存储 / 1 GB 月流量，大包注意配额。
 */
export type DemoProject = {
  /** 文档组件 `demo` 属性使用的稳定 id */
  id: string;
  title: string;
  description: string;
  /** 分类：android / ios / flutter / web … */
  category: string;
  /** 位于 public/downloads/<category>/ 下的 zip 文件名 */
  filename: string;
  /** 对应文档路径，目录页会显示「查看文档」 */
  docs?: string;
  icon?: string;
  tags?: string[];
};

export const demoProjects: DemoProject[] = [
  {
    id: "hidden-dex-minidemo",
    title: "hidden-dex-minidemo",
    description:
      "把业务实现编成加密 DEX。运行时由 so 解密后在内存里加载。主 DEX 只保留公开接口。",
    category: "android",
    filename: "hidden-dex-minidemo.zip",
    docs: "/android/hidden-hardening",
    icon: "i-lucide-shield",
    tags: ["HiddenDEX", "加固"],
  },
];

export function findDemoById(id: string): DemoProject | undefined {
  return demoProjects.find((item) => item.id === id);
}

/** 相对 public/downloads/ 的路径，与扫描模块、下载 URL 共用 */
export function demoAssetKey(demo: Pick<DemoProject, "category" | "filename">): string {
  return `${demo.category}/${demo.filename}`;
}

export function demoDownloadPath(
  demo: Pick<DemoProject, "category" | "filename">,
): string {
  return `/downloads/${demoAssetKey(demo)}`;
}

export function listDemoCategoryTokens(): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const demo of demoProjects) {
    const token = demo.category.trim().toLowerCase();
    if (!token || seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
  }
  return tokens;
}

export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = value >= 10 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unit]}`;
}
