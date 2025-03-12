<template>
  <div class="panel flex" :class="{ compact: compactMode }">
    <div class="os-info">
      <div class="flex">
        <Dot :color="summarized.statusColor" :title="summarized.statusText" />
        <span class="name">{{ info.alias ?? info.name }}</span>
      </div>
    </div>
    <i class="separator" v-if="!compactMode" />
    <div class="detail">
      <div class="flex">
        <MiniPanel title="系统" :body="summarized.os" :capitalize="true" v-if="!compactMode">
          <template #icon><i :class="`fl-${summarized.os}`" /></template>
        </MiniPanel>
        <MiniPanel title="运行时间" :body="summarized.uptime" v-if="!compactMode" />
        <MiniPanel title="CPU" :body="summarized.cpu + '%'" :progress="summarized.cpu" />
        <MiniPanel title="内存" :body="summarized.mem + '%'" :progress="summarized.mem" />
        <MiniPanel title="存储" :body="summarized.disk + '%'" :progress="summarized.disk" />
        <MiniPanel title="上传" :body="summarized.upload" />
        <MiniPanel title="下载" :body="summarized.download" />
        <MiniPanel title="总上传" :body="summarized.total_upload" v-if="!compactMode" />
        <MiniPanel title="总下载" :body="summarized.total_download" v-if="!compactMode" />
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

const props = defineProps<{
  info: ServerInfo
  size: string
}>()

const compactMode = computed(() => props.size === 'compact')

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
  ret.upload = filesize(props.info.network_tx.toFixed(2), { standard: 'jedec' }) + '/s'
  ret.download = filesize(props.info.network_rx.toFixed(2), { standard: 'jedec' }) + '/s'
  ret.total_upload = filesize(props.info.network_out.toFixed(2), {
    standard: 'jedec',
  })
  ret.total_download = filesize(props.info.network_in.toFixed(2), {
    standard: 'jedec',
  })
  return ret
})
</script>

<style lang="less" scoped>
@import '../assets/common.less';

.panel {
  .card-base;
  padding-top: 10px;
  padding-bottom: 10px;
  cursor: default;
  align-items: center;

  &:hover {
    background-color: #f8f8f7;
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
      justify-content: space-between;
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
