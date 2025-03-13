<template>
  <div class="panel flex" :class="{ compact: compactMode }">
    <div class="os-info">
      <div class="flex">
        <Dot :color="summarized.statusColor" :title="summarized.statusText" />
        <img :src="summarized.flag" class="flag" v-if="summarized.flag" />
        <span class="name">{{ info.alias ?? info.name }}</span>
      </div>
    </div>
    <i class="separator" v-if="!compactMode" />
    <div class="detail">
      <div class="flex">
        <MiniPanel
          :title="locale.System"
          :body="summarized.os"
          :capitalize="true"
          v-if="!compactMode"
        >
          <template #icon><i :class="`fl-${summarized.os}`" /></template>
        </MiniPanel>
        <MiniPanel :title="locale.Uptime" :body="summarized.uptime" v-if="!compactMode" />
        <MiniPanel title="CPU" :body="summarized.cpu + '%'" :progress="summarized.cpu" />
        <MiniPanel :title="locale.Memory" :body="summarized.mem + '%'" :progress="summarized.mem" />
        <MiniPanel
          :title="locale.Storage"
          :body="summarized.disk + '%'"
          :progress="summarized.disk"
        />
        <MiniPanel :title="locale.Upload" :body="summarized.upload" />
        <MiniPanel :title="locale.Download" :body="summarized.download" />
        <MiniPanel
          :title="trafficMode === 'monthly' ? locale.MonthlyUp : locale.TotalUp"
          :body="summarized.total_upload"
          v-if="!compactMode"
        />
        <MiniPanel
          :title="trafficMode === 'monthly' ? locale.MonthlyDown : locale.TotalDown"
          :body="summarized.total_download"
          v-if="!compactMode"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServerInfo } from '@/typing.d/stat'
import Dot from './Dot.vue'
import MiniPanel from './MiniPanel.vue'
import { computed } from 'vue'
import 'font-logos/assets/font-logos.css'
import { filesize } from 'filesize'
import flags from '@/assets/flags.json'
import { useTranslation } from '@/useTranslation'

const props = defineProps<{
  info: ServerInfo
  size: string
  trafficMode: string
}>()

const locale = useTranslation()
const compactMode = computed(() => props.size === 'compact')
const formatSize = (size: number) =>
  filesize(size, { standard: 'jedec', round: size > 1024 * 1024 ? 2 : 0 })

const summarized = computed(() => {
  const ret: Record<string, string> = {}
  const lbls = props.info.labels.split('=')
  ret.statusColor = 'red'
  ret.statusText = 'offline'
  if (props.info.online4 && props.info.online6) {
    ret.statusColor = 'green'
    ret.statusText = 'IPv4 & IPv6'
  } else if (props.info.online4) {
    ret.statusColor = 'blue'
    ret.statusText = 'IPv4 only'
  } else if (props.info.online6) {
    ret.statusColor = 'yellow'
    ret.statusText = 'IPv6 only'
  }
  ret.os = lbls?.length > 1 && lbls[0] === 'os' ? lbls[1] : 'unknown'
  ret.uptime = props.info.uptime
  ret.cpu = props.info.cpu.toString()
  ret.mem = ((props.info.memory_used / props.info.memory_total) * 100).toFixed(2)
  ret.disk = ((props.info.hdd_used / props.info.hdd_total) * 100).toFixed(2)
  ret.upload = formatSize(props.info.network_tx) + '/s'
  ret.download = formatSize(props.info.network_rx) + '/s'
  ret.flag = (flags as Record<string, boolean>)[props.info.location]
    ? `flags/${props.info.location}.svg`
    : ''
  ret.total_upload = formatSize(
    props.trafficMode === 'monthly'
      ? props.info.network_out - props.info.last_network_out
      : props.info.network_out,
  )
  ret.total_download = formatSize(
    props.trafficMode === 'monthly'
      ? props.info.network_in - props.info.last_network_in
      : props.info.network_in,
  )
  return ret
})
</script>

<style lang="less" scoped>
@import '../assets/common.less';

.panel {
  .card-base;
  padding: 10px;
  padding-left: 24px;
  cursor: default;
  align-items: center;

  &:hover {
    background-color: var(--color-hover);
  }

  .flag {
    width: 16px;
    box-shadow: 0 0 2px 1px var(--color-border);
  }

  .os-info {
    flex: 0 0 130px;

    > .flex {
      align-items: center;
      justify-content: start;
    }
  }

  .detail {
    white-space: nowrap;
    flex: 1 1 100%;

    > .flex {
      justify-content: space-evenly;
      align-items: center;
    }
  }

  .os-info {
    min-width: 100px;
  }

  .name {
    flex: 1 1 90px;
    min-width: 0;
    margin-left: 6px;
    font-weight: 700;
  }

  .inline-block {
    display: inline-block;
  }

  .separator {
    align-self: stretch;
    margin-right: 10px;
    flex: 0 0 1px;
  }

  @media screen and (max-width: 1024px) {
    &.compact {
      flex-direction: column;
      padding: 16px 0;

      .os-info,
      .detail {
        .flex {
          justify-content: center;
        }
      }

      .os-info {
        flex: 0 0 auto;
      }

      .separator {
        display: none;
      }
    }
  }
}
</style>
