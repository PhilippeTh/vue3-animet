<template>
  <v-col class="flex-grow-1 flex-shrink-0">
    <v-row class="d-flex justify-space-between top_row">
      <div>
        <arrow-controls action="first" class="button_group"></arrow-controls>
        <arrow-controls action="previous" class="button_group"></arrow-controls>
      </div>
      <span class="text-wrap">
        {{
          localeDateFormat(
            mapTimeSettings.Extent[mapTimeSettings.DateIndex],
            mapTimeSettings.Step,
            dateFormat,
          )
        }}
      </span>
      <div>
        <arrow-controls action="next" class="button_group"></arrow-controls>
        <arrow-controls action="last" class="button_group"></arrow-controls>
      </div>
    </v-row>
    <v-row>
      <play-pause-controls
        v-if="!hide"
        class="play-pause"
      ></play-pause-controls>
      <v-col class="pl-0">
        <v-range-slider
          class="range_slider"
          ref="rangeSlider"
          v-model="datetimeRangeSlider"
          :disabled="isAnimating"
          :min="0"
          :max="mapTimeSettings.Extent.length - 1"
          :step="1"
          :rules="[rangeValuesNotSame]"
          :color="hideRangeSlider"
          :thumb-color="hideRangeSlider"
          :track-color="hideRangeSlider"
          :track-fill-color="hideRangeSlider"
          :track-size="2"
          hide-details
          @end="handleEnd"
          @update:model-value="changeDisplayedTime"
        ></v-range-slider>
        <v-slider
          class="mt-n8 play-head"
          :readonly="isAnimating"
          :min="0"
          :max="mapTimeSettings.Extent.length - 1"
          :step="1"
          color="rgba(0, 0, 0, 0)"
          track-color="rgba(0, 0, 0, 0)"
          :track-size="2"
          thumb-color="rgba(231, 116, 22, 0.5)"
          :thumb-size="12"
          hide-details
          v-model="currentTime"
          @end="handleEnd"
          @keydown.left.right.stop
        ></v-slider>
      </v-col>
    </v-row>
    <v-row justify="space-between" class="mt-n6 bottom_row">
      <v-col class="text-left text-wrap px-0">{{
        formatDate(datetimeRangeSlider[0], dateFormat)
      }}</v-col>
      <v-col class="text-right text-wrap px-0">{{
        formatDate(datetimeRangeSlider[1], dateFormat)
      }}</v-col>
    </v-row>
  </v-col>
</template>

<script>
import datetimeManipulations from '../../mixins/datetimeManipulations'

import ArrowControls from './AnimationControls/ArrowControls.vue'
import PlayPauseControls from './AnimationControls/PlayPauseControls.vue'

export default {
  inject: ['store'],
  props: {
    hide: Boolean,
  },
  mixins: [datetimeManipulations],
  components: {
    ArrowControls,
    PlayPauseControls,
  },
  data() {
    return {
      screenWidth: window.innerWidth,
      throttle: false,
    }
  },
  mounted() {
    window.addEventListener('keydown', this.movePlayHead)
    window.addEventListener('resize', this.updateScreenSize)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.movePlayHead)
    window.removeEventListener('resize', this.updateScreenSize)
  },
  methods: {
    handleEnd() {
      document.activeElement.blur()
    },
    movePlayHead(event) {
      if (!this.throttle) {
        this.throttle = true
        switch (event.key) {
          case 'ArrowLeft':
            if (this.mapTimeSettings.DateIndex > this.datetimeRangeSlider[0]) {
              this.store.setMapTimeIndex(this.mapTimeSettings.DateIndex - 1)
            } else {
              this.store.setMapTimeIndex(this.datetimeRangeSlider[1])
            }
            break
          case 'ArrowRight':
            if (this.mapTimeSettings.DateIndex < this.datetimeRangeSlider[1]) {
              this.store.setMapTimeIndex(this.mapTimeSettings.DateIndex + 1)
            } else {
              this.store.setMapTimeIndex(this.datetimeRangeSlider[0])
            }
            break
        }
        setTimeout(() => {
          this.throttle = false
        }, 250)
      }
    },
    rangeValuesNotSame(rangeInput) {
      return !(rangeInput[0] === rangeInput[1])
    },
    updateScreenSize() {
      this.screenWidth = window.innerWidth
    },
    changeDisplayedTime() {
      this.emitter.emit('changeTab')
      if (
        this.mapTimeSettings.Extent[this.mapTimeSettings.DateIndex] <
        this.mapTimeSettings.Extent[this.datetimeRangeSlider[0]]
      ) {
        this.store.setMapTimeIndex(this.datetimeRangeSlider[0])
        this.emitter.emit('adjustMapTime')
      } else if (
        this.mapTimeSettings.Extent[this.mapTimeSettings.DateIndex] >
        this.mapTimeSettings.Extent[this.datetimeRangeSlider[1]]
      ) {
        this.store.setMapTimeIndex(this.datetimeRangeSlider[1])
        this.emitter.emit('adjustMapTime')
      }
      if (this.mapTimeSettings.SnappedLayer !== null) {
        this.store.setMapSnappedLayer(null)
      }
      this.emitter.emit('updatePermalink')
    },
    formatDate(index, format) {
      if (index > this.mapTimeSettings.Extent.length - 1) {
        index = this.mapTimeSettings.Extent.length - 1
      } else if (index < 0) {
        index = 0
      }
      return this.localeDateFormat(
        this.mapTimeSettings.Extent[index],
        this.mapTimeSettings.Step,
        format,
      )
    },
  },
  computed: {
    isAnimating() {
      return this.store.getIsAnimating
    },
    mapTimeSettings() {
      return this.store.getMapTimeSettings
    },
    currentTime: {
      get() {
        return this.mapTimeSettings.DateIndex
      },
      set(newDateIndex) {
        this.emitter.emit('changeTab')
        if (this.mapTimeSettings.DateIndex !== null) {
          if (newDateIndex < this.datetimeRangeSlider[0]) {
            this.store.setMapSnappedLayer(null)
            this.store.setDatetimeRangeSlider([
              newDateIndex,
              this.datetimeRangeSlider[1],
            ])
          } else if (newDateIndex > this.datetimeRangeSlider[1]) {
            this.store.setMapSnappedLayer(null)
            this.store.setDatetimeRangeSlider([
              this.datetimeRangeSlider[0],
              newDateIndex,
            ])
          }
        }
        this.store.setMapTimeIndex(newDateIndex)
        this.emitter.emit('updatePermalink')
      },
    },
    dateFormat() {
      if (this.screenWidth > 850) {
        return 'DATETIME_FULL'
      } else if (this.screenWidth > 720) {
        return 'DATETIME_MED'
      } else {
        return 'DATETIME_SHORT'
      }
    },
    datetimeRangeSlider: {
      get() {
        return this.store.getDatetimeRangeSlider
      },
      set(dateRange) {
        this.store.setDatetimeRangeSlider(dateRange)
      },
    },
    hideRangeSlider() {
      if (
        this.mapTimeSettings.Extent !== null &&
        this.mapTimeSettings.Extent.length === 1
      ) {
        return 'rgba(0, 0, 0, 0)'
      } else {
        return 'primary'
      }
    },
  },
}
</script>

<style>
.play-head {
  --v-focus-opacity: 0.2 !important;
  --v-hover-opacity: 0.2 !important;
  --v-pressed-opacity: 0.4 !important;
}
.play-head .v-slider-thumb {
  z-index: 3;
}
.play-head .v-slider-thumb__surface {
  box-shadow: none !important;
}
.play-head .v-slider-thumb__surface::before {
  z-index: 3;
}
.play-head .v-slider-thumb__surface::after {
  height: 24px;
  width: 24px;
}
.play-head .v-slider-track {
  z-index: 1;
}
.play-head .v-slider-thumb--pressed {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.play-head .v-slider-track__fill {
  height: 2px !important;
}
.range_slider {
  --v-focus-opacity: 0.2 !important;
  --v-hover-opacity: 0.2 !important;
  --v-pressed-opacity: 0.5 !important;
}
.range_slider .v-slider__container .v-slider-thumb {
  transform: translate(114%, -50%) !important;
}
.range_slider .v-slider-thumb {
  z-index: 2;
}
.range_slider .v-slider-thumb__surface::before {
  top: -6px;
  left: -15px;
  width: 36px;
  height: 36px;
  z-index: 2;
}
.range_slider .v-slider-thumb--focused .v-slider-thumb__surface::before,
.range_slider .v-slider-thumb:hover .v-slider-thumb__surface::before {
  transform: scale(1) !important;
}
.range_slider .v-slider-thumb__ripple {
  left: calc(var(--v-slider-thumb-size) / -1.3);
  top: calc(var(--v-slider-thumb-size) / -3.4);
  width: 36px;
  height: 36px;
}
.range_slider .v-slider-thumb__surface {
  width: 6px;
  height: 24px;
  position: relative;
  border-radius: 15px;
}
.range_slider .v-slider-track__fill {
  height: 2px !important;
}
</style>

<style scoped>
.button_group {
  display: inline-block;
}
.top_row {
  padding-left: 31px;
  padding-right: 7px;
  padding-top: 8px;
  margin-bottom: -26px;
}
.bottom_row {
  padding-left: 40px;
  padding-right: 17px;
}
.play-pause {
  display: flex;
  align-items: center;
  justify-content: center;
}
.text-wrap {
  overflow: hidden;
  white-space: nowrap !important;
  text-overflow: ellipsis;
}
</style>
