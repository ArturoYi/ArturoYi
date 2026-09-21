import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { defineNuxtModule } from "@nuxt/kit";
import { demoAssetKey, demoProjects } from "../config/demos";

export type DemoAssetInfo = {
  size: number;
};

function collectZipAssets(
  dir: string,
  root: string,
  out: Record<string, DemoAssetInfo>,
) {
  if (!existsSync(dir)) return;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectZipAssets(full, root, out);
      continue;
    }
    if (!entry.name.toLowerCase().endsWith(".zip")) continue;
    const key = relative(root, full).split("\\").join("/");
    const asset = readZipAsset(full);
    if (asset.lfsPointer) {
      console.warn(
        `[demo-assets] LFS pointer not pulled: public/downloads/${key}（安装 git-lfs 后执行 git lfs pull）`,
      );
    }
    out[key] = { size: asset.size };
  }
}

const LFS_POINTER_HEAD = "version https://git-lfs.github.com/spec/v1";

/** 未 smudge 的 LFS 指针很小；体积优先读 pointer 里的 size 字段 */
function readZipAsset(full: string): DemoAssetInfo & { lfsPointer?: boolean } {
  const stat = statSync(full);
  if (stat.size > 1024) return { size: stat.size };

  try {
    const text = readFileSync(full, "utf8");
    if (!text.startsWith(LFS_POINTER_HEAD)) return { size: stat.size };
    const match = text.match(/^size (\d+)/m);
    return {
      size: match ? Number(match[1]) : stat.size,
      lfsPointer: true,
    };
  } catch {
    return { size: stat.size };
  }
}

/**
 * 扫描 public/downloads 下的 zip，把体积写入 runtimeConfig，
 * 供下载卡片显示大小；登记了但文件不存在时给出构建警告。
 */
export default defineNuxtModule({
  meta: { name: "demo-assets" },
  setup(_options, nuxt) {
    const demosDir = join(nuxt.options.rootDir, "public", "downloads");
    const assets: Record<string, DemoAssetInfo> = {};
    collectZipAssets(demosDir, demosDir, assets);

    nuxt.options.runtimeConfig.public.demoAssets = assets;

    for (const demo of demoProjects) {
      const key = demoAssetKey(demo);
      if (!assets[key]) {
        console.warn(`[demo-assets] missing zip: public/downloads/${key}`);
      }
    }
  },
});
