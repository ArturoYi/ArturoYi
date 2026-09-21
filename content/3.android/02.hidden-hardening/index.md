---
title: 总览
description: hidden-dex-minidemo 把业务实现编成加密 DEX。运行时由 so 解密后在内存里加载。主 DEX 只保留薄接口。
date: 2026-09-21
navigation:
  icon: i-lucide-map
seo:
  title: Hidden DEX 代码加固总览
  description: 梳理 hidden-dex-minidemo 当前使用的加固方式：加密 DEX、Native 解密、内存加载、指令分发、XOR 混淆、密钥外置、依赖隔离、构建校验、防录屏与 ABI 门禁。
links:
  - label: 加密DEX
    icon: i-lucide-lock
    to: /android/hidden-hardening/encrypt-dex
  - label: Native解密
    icon: i-lucide-cpu
    to: /android/hidden-hardening/native-decrypt
  - label: 指令分发
    icon: i-lucide-hash
    to: /android/hidden-hardening/opcode-dispatch
categories:
  - android
tags:
  - Android
  - HiddenDEX
  - 加固
---

`hidden-dex-minidemo` 隐藏的是 **自管理来电实现**，不是整个 App。宿主只依赖公开 SDK。真正的 `HiddenLandingPage` 在构建期打成加密 DEX，放入 AAR 的 `assets/`。进程启动后，由 `libhiddendecrypt.so` 解密，并在内存里加载。

::warning
这只能提高静态分析成本，并不能彻底防止反编译。so 仍可被 hook，密钥仍须由接入方保管。用 JADX 打开主 DEX，只能看到 `HiddenSdk.invoke(Int, Any?, Any?)`。
::

## 下载示例

可运行工程与本文档对应，归在 Android 分类。解压后用 Android Studio 打开。

::demo-download
---
demo: hidden-dex-minidemo
---
::

## 产物如何拆分

接入方拿到的 AAR：

```text
hidden-sdk-1.0.0.aar
├── classes.jar
│   ├── HiddenSdk
│   └── HiddenInitResult
├── jni/*/libhiddendecrypt.so
├── assets/payload/hidden.dex.enc
└── proguard.txt
```

公开接口只剩：

```kotlin
object HiddenSdk {
    fun init(context: Context, payloadKey: String?): HiddenInitResult
    fun invoke(op: Int, a: Any? = null, b: Any? = null): Any?
}
```

`:hidden-landing-page` 只在 SDK 仓库里编 jar → d8 → AES-256-GCM，不要给宿主 `implementation`。

| 模块 | 给接入方吗 | 进主 DEX？ |
| --- | --- | --- |
| `:hidden-sdk` | 只交付这个 AAR | 接口、JNI、KeepAlive 壳 |
| `:hidden-landing-page` | 不交付 | 否，只进加密 payload |
| `:app` | 不发布 | 权限、清单壳、Compose 页 |

## 十种加固方式

::u-page-section
  :::u-page-grid
    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-lock
    to: /android/hidden-hardening/encrypt-dex
    class: col-span-2 lg:col-span-1
    ---
    #title
    加密DEX

    #description
    构建期把 landing-page 打成 AES-256-GCM 密文，文件头为 HDX1。
    ::::

    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-cpu
    to: /android/hidden-hardening/native-decrypt
    class: col-span-2 lg:col-span-1
    ---
    #title
    Native解密

    #description
    自实现 AES-GCM 在 so 里运行，Java 不接触明文 DEX。
    ::::

    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-memory-stick
    to: /android/hidden-hardening/memory-load
    class: col-span-2 lg:col-span-1
    ---
    #title
    内存加载

    #description
    InMemoryDexClassLoader 接收 ByteBuffer，不落明文文件。
    ::::

    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-hash
    to: /android/hidden-hardening/opcode-dispatch
    class: col-span-2 lg:col-span-1
    ---
    #title
    指令分发

    #description
    公开入口只有 invoke(op)，对照表不进入 AAR。
    ::::

    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-shuffle
    to: /android/hidden-hardening/xor-obfuscate
    class: col-span-2 lg:col-span-1
    ---
    #title
    XOR混淆

    #description
    资源路径、类名、方法名在 so 里按 0x5A 异或。
    ::::

    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-key
    to: /android/hidden-hardening/key-external
    class: col-span-2 lg:col-span-1
    ---
    #title
    密钥外置

    #description
    AAR 不带密钥。CI 用环境变量，本地用 gitignore 文件。
    ::::

    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-layers
    to: /android/hidden-hardening/dep-isolate
    class: col-span-2 lg:col-span-1
    ---
    #title
    依赖隔离

    #description
    compileOnly 加解析期检查，禁止明文 class 进入 APK。
    ::::

    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-shield-check
    to: /android/hidden-hardening/build-verify
    class: col-span-2 lg:col-span-1
    ---
    #title
    构建校验

    #description
    AAR、APK、源码三道检查，漏依赖则无法通过编译。
    ::::

    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-eye-off
    to: /android/hidden-hardening/flag-secure
    class: col-span-2 lg:col-span-1
    ---
    #title
    防录屏

    #description
    FLAG_SECURE。未 init 也会给当前页加上该标志。
    ::::

    ::::u-page-card
    ---
    spotlight: true
    icon: i-lucide-git-compare
    to: /android/hidden-hardening/abi-gate
    class: col-span-2 lg:col-span-1
    ---
    #title
    ABI门禁

    #description
    so 与加密实现约定版本 12，对不上就拒绝加载。
    ::::
  :::
::

## 运行时序

::steps
### 宿主先 init

`Application.onCreate` 传入 64 个 hex 字符。密钥为空则直接失败，不读取 assets。

### so 读密文

`AAssetManager` 打开 XOR 后的路径 `payload/hidden.dex.enc`。

### AES-GCM 解密

校验 `HDX1` 头和 GCM tag。明文必须以 `dex` 开头。

### 内存里 loadClass

`InMemoryDexClassLoader` 加载 XOR 后的 `HiddenLandingPage`，并核对 ABI。

### invoke 分发

Java 只传整数指令，native 再通过 `GetMethodID` 调用实现。
::

::tip
可读的方法名应放在宿主自己的包装里，例如 Demo 的 `HostBridge`。不要把对照表写进 SDK 源码。
::

## 下一步

- 从 [加密DEX](/android/hidden-hardening/encrypt-dex) 了解密文如何生成
- 对照仓库 `接入与使用.md` 查看接入约定
- 到 [示例项目](/demos) 按分类浏览全部可下载工程
