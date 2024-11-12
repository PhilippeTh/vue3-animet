<template>
  <div class="tree-node">
    <div @click="handleClick(node)" class="node-content">
      <div class="content-wrapper">
        <v-icon v-if="node.children" class="toggle-icon">
          {{ node.isOpen ? 'mdi-menu-down' : 'mdi-menu-right' }}
        </v-icon>
        <span class="title">
          {{ node.name }}
        </span>
      </div>
    </div>
    <div v-if="node.children && node.isOpen" class="children">
      <locale-tree-node
        v-for="child in node.children"
        :key="child.name"
        :node="child"
        @node-toggled="bubbleNodeToggled"
        @request="bubbleNodeRequest"
      ></locale-tree-node>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'

const store = inject('store')

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
})

const isOpen = ref(props.node.isOpen || false)

watch(
  () => props.node.isOpen,
  (newValue) => {
    isOpen.value = newValue
  },
)

const isAnimating = computed(() => {
  return store.getIsAnimating
})
const playState = computed(() => {
  return store.getPlayState
})

const emit = defineEmits(['nodeToggled', 'request'])

const handleClick = (node) => {
  if (node.children) toggle()
  else request(node)
}
const toggle = () => {
  if (props.node.children) {
    isOpen.value = !isOpen.value
    props.node.isOpen = isOpen.value
    emit('nodeToggled', props.node.name, isOpen.value)
  }
}
const request = (node) => {
  if (isAnimating.value && playState.value !== 'play') return
  emit('request', node)
}

// Bubble up the event for the nested tree-nodes
const bubbleNodeToggled = (nodeName, isOpen) => {
  emit('nodeToggled', nodeName, isOpen)
}
const bubbleNodeRequest = (node) => {
  if (isAnimating.value && playState.value !== 'play') return
  emit('request', node)
}
</script>

<style scoped>
.children {
  padding-left: 20px;
}
.content-wrapper {
  align-items: center;
  display: flex;
  max-height: 38px;
}
.node-content {
  cursor: pointer;
  overflow: hidden;
  user-select: none;
  white-space: nowrap;
}
.node-content:hover {
  background-color: rgba(211, 211, 211, 0.2);
  transition: background-color 0.3s ease;
}
.title {
  overflow: hidden;
  text-overflow: ellipsis;
}
.toggle-icon {
  width: 20px;
}
.tree-node {
  line-height: 1.8;
  position: relative;
}
</style>
