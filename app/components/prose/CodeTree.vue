<!--
  本地覆盖 @nuxt/ui 的 ProseCodeTree（MDC 组件 code-tree / 文档「代码树」示例）。

  原因：@nuxt/ui 内置实现在 computed（flatItems）里调用 slots.default()，在 Vue 3.5+
  会触发控制台警告：
  「Slot "default" invoked outside of the render function」
  堆栈常见于含 code-tree 的内容页（外层经 ProseCodePreview 渲染）。

  做法：注册同名组件 app/components/prose/CodeTree.vue，Nuxt Content 会优先使用本文件；
  逻辑与官方版一致，仅通过 ProseCodeTreeSlotSync 在 render 中读取 default slot，
  再写入 slotFlatItems，供 flatItems / 文件树与右侧代码面板使用。

  维护：@nuxt/ui 上游修复后可删除本文件，恢复使用内置 ProseCodeTree。
-->
<script lang="ts">
import type { VNode } from 'vue'
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/prose/code-tree'
import type { ComponentConfig } from '#ui/types/tv'

type ProseCodeTreeConfig = ComponentConfig<typeof theme, AppConfig, 'codeTree', 'ui.prose'>

type TreeNode = {
  label: string
  path: string
  children?: TreeNode[]
}

type TreeItem = {
  label: string
  icon?: string
  component: VNode
}

export interface ProseCodeTreeProps {
  items?: TreeItem[]
  modelValue?: string
  defaultValue?: string
  expandAll?: boolean
  class?: unknown
  ui?: ProseCodeTreeConfig['slots']
}

export interface ProseCodeTreeEmits {
  'update:modelValue': [value: string | undefined]
}

export interface ProseCodeTreeSlots {
  default(props?: Record<string, never>): VNode[]
}
</script>

<script setup lang="ts">
import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import { TreeRoot, TreeItem } from 'reka-ui'
import { createReusableTemplate } from '@vueuse/core'
import { useAppConfig } from '#imports'
import { useComponentProps } from '#ui/composables/useComponentProps'
import { tv } from '#ui/utils/tv'

defineOptions({ inheritAttrs: false })

const _props = defineProps<ProseCodeTreeProps>()
const emits = defineEmits<ProseCodeTreeEmits>()

const props = useComponentProps('prose.codeTree', _props)

const appConfig = useAppConfig() as ProseCodeTreeConfig['AppConfig']

const [DefineTreeTemplate, ReuseTreeTemplate] = createReusableTemplate<{ items: TreeNode[], level: number }>()

const ui = computed(() => tv({ extend: theme, ...(appConfig.ui?.prose?.codeTree || {}) })())

// 将 MDC 子节点（pre/code 等）转为带 label 与 VNode 的扁平项，供 buildTree 使用
function transformSlot(slot: any, index: number): any {
  if (typeof slot.type === 'symbol') {
    return slot.children?.map(transformSlot)
  }

  return {
    label: slot.props?.filename || slot.props?.label || `${index}`,
    icon: slot.props?.icon,
    component: slot,
  }
}

// 无 props.items 时，由下方模板中的 <ProseCodeTreeSlotSync> 在 render 内同步 slot 内容
const slotFlatItems = shallowRef<TreeItem[]>([])

/** 仅负责在 render 函数内调用 slots.default()，不渲染 DOM */
const ProseCodeTreeSlotSync = defineComponent({
  name: 'ProseCodeTreeSlotSync',
  setup(_, { slots }) {
    return () => {
      slotFlatItems.value = (slots.default?.()?.flatMap(transformSlot).filter(Boolean) || []) as TreeItem[]
      return null
    }
  },
})

const flatItems = computed<TreeItem[]>(() => props.items || slotFlatItems.value)

const items = computed(() => buildTree(flatItems.value))

function buildTree(flat: { label: string }[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const root: TreeNode[] = []

  flat.forEach((item) => {
    const parts = item.label.split('/')
    let path = ''

    parts.forEach((part, i) => {
      path = path ? `${path}/${part}` : part

      if (!map.has(path)) {
        const node: TreeNode = { label: part, path, ...(i < parts.length - 1 && { children: [] }) }
        map.set(path, node)

        if (i === 0) {
          root.push(node)
        }
        else {
          map.get(parts.slice(0, i).join('/'))?.children?.push(node)
        }
      }
    })
  })

  const sort = (nodes: TreeNode[]): TreeNode[] =>
    nodes.sort((a, b) =>
      !!a.children === !!b.children ? a.label.localeCompare(b.label) : b.children ? 1 : -1,
    ).map(n => ({ ...n, children: n.children && sort(n.children) }))

  return sort(root)
}

function getExpandedPaths(path?: string) {
  if (props.expandAll) {
    const allPaths = new Set<string>()
    flatItems.value.forEach((item) => {
      const parts = item.label.split('/')
      for (let i = 1; i < parts.length; i++) {
        allPaths.add(parts.slice(0, i).join('/'))
      }
    })
    return Array.from(allPaths)
  }

  if (!path) {
    return []
  }

  const parts = path.split('/')
  return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('/'))
}

const initialPath = props.modelValue ?? props.defaultValue
const model = ref(initialPath ? { path: initialPath } : undefined)
const lastSelectedItem = ref<TreeItem>()
const expanded = ref(getExpandedPaths(model.value?.path))

watch(model, (value) => {
  if (value?.path !== props.modelValue) {
    emits('update:modelValue', value?.path)
  }
})

watch(() => props.modelValue, (value) => {
  if (value === model.value?.path) {
    return
  }

  model.value = value ? { path: value } : undefined
  const pathsToExpand = getExpandedPaths(value)
  for (const path of pathsToExpand) {
    if (!expanded.value.includes(path)) {
      expanded.value.push(path)
    }
  }
})

watch(flatItems, (newItems, oldItems) => {
  if (!props.expandAll) {
    return
  }

  const newLabels = newItems.map(i => i.label).join('\n')
  const oldLabels = oldItems?.map(i => i.label).join('\n') ?? ''

  if (newLabels !== oldLabels) {
    expanded.value = getExpandedPaths()
  }
})

watch(model, (value) => {
  const item = flatItems.value.find(item => value?.path === item.label)
  if (item?.component) {
    lastSelectedItem.value = item
  }
}, { immediate: true })
</script>

<!-- eslint-disable vue/no-template-shadow -->
<template>
  <ProseCodeTreeSlotSync v-if="!props.items">
    <slot />
  </ProseCodeTreeSlotSync>

  <DefineTreeTemplate v-slot="{ items: treeItems, level }">
    <li
      v-for="(item, index) in treeItems"
      :key="`${level}-${index}`"
      role="presentation"
      :class="level > 1 ? ui.itemWithChildren({ class: props.ui?.itemWithChildren }) : ui.item({ class: props.ui?.item })"
    >
      <TreeItem
        v-slot="{ isExpanded, isSelected }"
        :level="level"
        :value="item"
        as-child
      >
        <button
          type="button"
          :class="ui.link({ class: props.ui?.link, active: isSelected })"
        >
          <UIcon
            v-if="item.children?.length"
            :name="isExpanded ? appConfig.ui.icons.folderOpen : appConfig.ui.icons.folder"
            :class="ui.linkLeadingIcon({ class: props.ui?.linkLeadingIcon })"
          />
          <ProseCodeIcon
            v-else
            :filename="item.label"
            :class="ui.linkLeadingIcon({ class: props.ui?.linkLeadingIcon })"
          />

          <span :class="ui.linkLabel({ class: props.ui?.linkLabel })">
            {{ item.label }}
          </span>

          <span v-if="item.children?.length" :class="ui.linkTrailing({ class: props.ui?.linkTrailing })">
            <UIcon
              :name="appConfig.ui.icons.chevronDown"
              :class="ui.linkTrailingIcon({ class: props.ui?.linkTrailingIcon })"
            />
          </span>
        </button>

        <ul
          v-if="item.children?.length && isExpanded"
          role="group"
          :class="ui.listWithChildren({ class: props.ui?.listWithChildren })"
        >
          <ReuseTreeTemplate :items="item.children" :level="level + 1" />
        </ul>
      </TreeItem>
    </li>
  </DefineTreeTemplate>

  <div v-bind="$attrs" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <TreeRoot
      v-model="model"
      v-model:expanded="expanded"
      :class="ui.list({ class: props.ui?.list })"
      :items="items"
      :get-key="(item: TreeNode) => item.path"
    >
      <ReuseTreeTemplate :items="items" :level="1" />
    </TreeRoot>

    <div :class="ui.content({ class: props.ui?.content })">
      <component :is="lastSelectedItem?.component" />
    </div>
  </div>
</template>
