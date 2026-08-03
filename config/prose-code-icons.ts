/**
 * @nuxt/icon clientBundle 显式预打包列表（配合 nuxt.config icon.clientBundle.icons）。
 * scan 无法发现的来源须写在这里：
 * - @nuxt/ui prose 代码块文件名 → codeIcon 映射
 * - content/.navigation.yml 栏目 icon（运行时字符串）
 * 格式：collection:name（与 Iconify 一致）。
 */
export const proseCodeIcons = [
  // app.config navigation.allIcon（scan 扫不到 app.config 字符串）
  "lucide:library",
  // content/.navigation.yml（playground 等栏目）
  "lucide:flask-conical",
  "lucide:layout-list",
  "lucide:layers",
  "lucide:terminal",
  "simple-icons:x",
  "simple-icons:discord",
  "simple-icons:nuxt",
  "simple-icons:github",
  "vscode-icons:file-type-arduino",
  "vscode-icons:file-type-assembly",
  "vscode-icons:file-type-bicep",
  "vscode-icons:file-type-bun",
  "vscode-icons:file-type-cppheader",
  // css 代码块语言标签由 @nuxt/ui prose 动态映射，scan 无法发现
  "vscode-icons:file-type-css",
  "vscode-icons:file-type-csharp",
  "vscode-icons:file-type-dartlang",
  "vscode-icons:file-type-deno",
  "vscode-icons:file-type-dotenv",
  "vscode-icons:file-type-editorconfig",
  "vscode-icons:file-type-elixir",
  "vscode-icons:file-type-erlang",
  "vscode-icons:file-type-eslint",
  "vscode-icons:file-type-favicon",
  "vscode-icons:file-type-fortran",
  "vscode-icons:file-type-fsharp",
  "vscode-icons:file-type-git",
  "vscode-icons:file-type-gleam",
  "vscode-icons:file-type-go",
  "vscode-icons:file-type-haskell",
  "vscode-icons:file-type-js",
  "vscode-icons:file-type-julia",
  "vscode-icons:file-type-kotlin",
  "vscode-icons:file-type-lisp",
  "vscode-icons:file-type-markdown",
  "vscode-icons:file-type-node",
  "vscode-icons:file-type-npm",
  "vscode-icons:file-type-nuxt",
  "vscode-icons:file-type-perl",
  "vscode-icons:file-type-pnpm",
  "vscode-icons:file-type-powershell",
  "vscode-icons:file-type-python",
  "vscode-icons:file-type-ruby",
  "vscode-icons:file-type-rust",
  "vscode-icons:file-type-scala",
  "vscode-icons:file-type-tailwind",
  "vscode-icons:file-type-tsconfig",
  "vscode-icons:file-type-typescript",
  "vscode-icons:file-type-vscode",
  "vscode-icons:file-type-vue",
  "vscode-icons:file-type-yaml",
  "vscode-icons:file-type-yarn",
] as const;
