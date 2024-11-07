<template>
  <div class="tree-node">
    <div @click="handleClick(node)" class="node-content">
      <div class="content-wrapper">
        <v-icon v-if="node.children" class="toggle-icon">
          {{ node.isOpen ? 'mdi-menu-down' : 'mdi-menu-right' }}
        </v-icon>
        <v-btn
          v-else
          icon
          class="icon-only-btn"
          density="comfortable"
          variant="text"
          :disabled="isAnimating && playState !== 'play'"
        >
          <v-icon
            color="primary"
            :disabled="isAnimating && playState !== 'play'"
          >
            {{
              $mapLayers.arr.some((l) => l.get('layerName') === node.Name)
                ? 'mdi-minus'
                : 'mdi-plus'
            }}
          </v-icon>
        </v-btn>
        <v-tooltip :text="node.Title" location="bottom" open-delay="750">
          <template v-slot:activator="{ props }">
            <span
              class="title"
              v-bind="props"
              :class="{
                'title-leaf': node.isLeaf,
                'text-primary': $mapLayers.arr.some(
                  (l) => l.get('layerName') === node.Name,
                ),
              }"
            >
              {{ node.Title }}
              <template v-if="node.isLeaf">
                <br />
                <span class="subtitle">{{ node.Name }}</span>
              </template>
            </span>
          </template>
        </v-tooltip>
      </div>
    </div>
    <div v-if="node.children && node.isOpen" class="children">
      <tree-node
        v-for="child in node.children"
        :key="child.Name"
        :node="child"
        @node-toggled="bubbleNodeToggled"
        @request="bubbleNodeRequest"
      ></tree-node>
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
    emit('nodeToggled', props.node.Name, isOpen.value)
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
.icon-only-btn {
  background-color: transparent;
  border: none;
  box-shadow: none;
}
.icon-only-btn:hover {
  background-color: rgba(211, 211, 211, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
.subtitle {
  color: grey;
  display: block;
  font-size: 0.8em;
  margin-top: -4px;
}
.title {
  overflow: hidden;
  text-overflow: ellipsis;
}
.title-leaf {
  display: block;
  line-height: 1.4;
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
