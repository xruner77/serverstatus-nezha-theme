<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div class="banner">Nezha Theme for Serverstatus-Rust</div>
    <div class="info">
      <div style="font-weight: 600; font-size: 16px">👋 概览</div>
      <div style="font-weight: 500; font-size: 14px">
        <span style="color: #91908f; margin-right: 5px">当前时间</span>{{ time }}
      </div>
    </div>
    <div class="summary">
      <SummaryCard
        title="服务器总数"
        :content="serverInfo.total"
        color="blue"
        @click="filterType = 'none'"
      />
      <SummaryCard
        title="在线服务器"
        :content="serverInfo.online"
        color="green"
        :glow="true"
        :selected="filterType === 'online'"
        @click="filterType = 'online'"
      />
      <SummaryCard
        title="离线服务器"
        :content="serverInfo.offline"
        color="red"
        :glow="true"
        :selected="filterType === 'offline'"
        @click="filterType = 'offline'"
      />
      <SummaryCard
        title="网络"
        color="purple"
        :selected="filterType === 'network'"
        @click="filterType = 'network'"
      >
        <div>
          <div class="total">
            <span class="total_upload">↑{{ network.total_upload }}</span>
            <span class="total_download">↓{{ network.total_download }}</span>
          </div>
          <div class="realtime">
            <span class="upload"
              ><img :src="icoUpload" class="network-icon" /><span>{{ network.upload }}</span></span
            >
            <span class="download"
              ><img :src="icoDownload" class="network-icon" /><span>{{
                network.download
              }}</span></span
            >
          </div>
        </div>
      </SummaryCard>
    </div>
    <div class="toolbar">
      <span class="view-type" @click="togglePanelSize" :class="{ down: panelSize === 'compact' }">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="size-[13px]"
        >
          <path
            d="M14 17h2.75A2.25 2.25 0 0 0 19 14.75v-9.5A2.25 2.25 0 0 0 16.75 3H14v14ZM12.5 3h-5v14h5V3ZM3.25 3H6v14H3.25A2.25 2.25 0 0 1 1 14.75v-9.5A2.25 2.25 0 0 1 3.25 3Z"
          ></path>
        </svg>
      </span>
      <el-radio-group v-model="group" size="mini" class="group">
        <el-radio-button v-for="g in groups" :key="g" :label="g"></el-radio-button>
      </el-radio-group>
    </div>
    <div class="list" :class="{ compact: panelSize === 'compact' }">
      <div class="scroll-box">
        <ServerPanel
          v-for="server in serverList"
          :key="server.name"
          :info="server"
          :size="panelSize"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SummaryCard from '@/components/SummaryCard.vue'
import ServerPanel from '@/components/ServerPanel.vue'
import type { ServerInfo, ServerStat } from '@/typing.d/stat'
import axios from 'axios'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import icoUpload from '@/assets/upload.svg'
import icoDownload from '@/assets/download.svg'
import { filesize } from 'filesize'

// get current time.
const time = ref<string>('')
const tmr = setInterval(() => {
  time.value = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}, 1000)

const group = ref('All')
const serverStats = ref<ServerStat>({ updated: 0, servers: [] })
const loadData = () => {
  axios.get<ServerStat>('/json/stats.json').then((res) => {
    serverStats.value = res.data
  })
}

const fetcher = setInterval(() => loadData(), 1000)
const filterType = ref('none')

// calculate server groups
const groups = computed(() => {
  const ret = ['All']
  serverStats.value.servers.reduce((acc, cur) => {
    if (!acc.includes(cur.gid)) {
      acc.push(cur.gid)
    }
    return acc
  }, ret)

  return ret
})

// server count info
const serverInfo = computed(() => {
  const ret = {
    total: serverStats.value.servers.length,
    online: serverStats.value.servers.filter((s) => s.online4 || s.online6).length,
    offline: 0,
  }
  ret.offline = ret.total - ret.online
  return ret
})

// summarize network stats.
const network = computed(() => {
  const ret = {
    upload: 0,
    download: 0,
    total_upload: 0,
    total_download: 0,
  }

  serverStats.value.servers.reduce((acc, cur) => {
    acc.upload += cur.network_tx
    acc.download += cur.network_rx
    acc.total_upload += cur.network_out
    acc.total_download += cur.network_in
    return acc
  }, ret)

  return {
    upload: filesize(ret.upload, { standard: 'jedec' }) + '/s',
    download: filesize(ret.download, { standard: 'jedec' }) + '/s',
    total_upload: filesize(ret.total_upload, { standard: 'jedec' }),
    total_download: filesize(ret.total_download, { standard: 'jedec' }),
  }
})

const panelSize = ref('normal')

const serverList = computed(() => {
  let servers: ServerInfo[] = [...serverStats.value.servers]
  switch (group.value) {
    case 'All':
      break
    default:
      servers = servers.filter((s) => s.gid === group.value)
  }

  switch (filterType.value) {
    case 'online':
      servers = servers.filter((s) => s.online4 || s.online6)
      break
    case 'offline':
      servers = servers.filter((s) => !s.online4 && !s.online6)
      break
    case 'network':
      servers.sort((a, b) => b.network_tx - a.network_tx)
      break
  }
  return servers
})

const togglePanelSize = () => {
  panelSize.value = panelSize.value === 'normal' ? 'compact' : 'normal'
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  clearInterval(tmr)
  clearInterval(fetcher)
})
</script>

<style lang="css" scoped>
.summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-column-gap: 20px;
  grid-row-gap: 15px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media screen and (max-width: 640px) {
    .upload,
    .download {
      display: block;
    }

    .total_download,
    .total_upload {
      font-size: 11px;
    }
  }
}

.info {
  margin: 10px 0;
}

.list {
  overflow-x: auto;

  .scroll-box {
    min-width: 1040px;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 10px;
  }

  &.compact {
    .scroll-box {
      min-width: 0;
      grid-template-columns: 1fr 1fr;

      @media screen and (max-width: 870px) {
        grid-template-columns: 1fr;
      }
    }
  }
}

.banner {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
}

.toolbar {
  margin: 20px 0;
}

.group {
  border-radius: 30px;
  padding: 4px;
  background-color: #f5f5f4;
  vertical-align: middle;
}

.network-icon {
  width: 12px;
  margin: 0 2px;
  vertical-align: middle;
}

.view-type {
  width: 32px;
  display: inline-block;
  height: 32px;
  padding: 6px;
  text-align: center;
  background-color: #f5f5f4;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 15px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #c8deff;
  }

  svg {
    fill: #2b7fff;
    height: 14px;
    width: 14px;
  }

  &.down {
    background-color: #2b7fff;
    svg {
      fill: white;
    }
  }
}

.realtime {
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;

  * {
    vertical-align: middle;
  }
}

.total_download {
  margin-left: 5px;
}

.total_upload {
  color: #2c4cbe;
}

.total_download {
  color: #6e11b0;
}

.upload {
  margin-right: 5px;
}

.total {
  font-size: 14px;
  font-weight: 500;
}

::v-deep(.el-radio-button__inner),
::v-deep(.el-radio-button) {
  border-radius: 22px !important;
  background-color: transparent;
  border: none !important;
  font-weight: 600;
  color: #aaa49f;

  &::v-deep(.is-active) {
    background-color: white;
  }

  &:hover {
    color: rgb(90, 90, 90);
  }
}

::v-deep(.el-radio-button.is-active .el-radio-button__inner) {
  background-color: white !important;
  color: black !important;
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    oklab(0 0 0 / 0.05) 0px 10px 15px -3px,
    oklab(0 0 0 / 0.05) 0px 4px 6px -4px !important;
}
</style>
