<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div class="banner">
      ServerStatus
      <div class="right-toolbar">
        <div class="quick-button" @click="toggleColorMode">
          <inline-svg :src="colorMode === 'light' ? icoLight : icoDark" />
        </div>
      </div>
    </div>
    <div class="info">
      <div style="font-weight: 600; font-size: 16px">👋 {{ locale.Summary }}</div>
      <div style="font-weight: 500; font-size: 14px">
        <span style="color: #91908f; margin-right: 5px">{{ locale.Time }}</span
        >{{ time }}<span class="loader" v-if="loading"></span>
      </div>
    </div>
    <div class="summary">
      <SummaryCard
        :title="locale.ServerCount"
        :content="serverInfo.total"
        color="blue"
        @click="filterType = 'none'"
      />
      <SummaryCard
        :title="locale.OnlineServer"
        :content="serverInfo.online"
        color="green"
        :glow="true"
        :selected="filterType === 'online'"
        @click="filterType = 'online'"
      />
      <SummaryCard
        :title="locale.OfflineServer"
        :content="serverInfo.offline"
        color="red"
        :glow="true"
        :selected="filterType === 'offline'"
        @click="filterType = 'offline'"
      />
      <SummaryCard
        :title="locale.Network"
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
              ><inline-svg :src="icoUpload" class="network-icon" /><span>{{
                network.upload
              }}</span></span
            >
            <span class="download"
              ><inline-svg :src="icoDownload" class="network-icon" /><span>{{
                network.download
              }}</span></span
            >
          </div>
        </div>
      </SummaryCard>
    </div>
    <div class="toolbar flex">
      <span
        class="quick-button primary"
        @click="toggleTrafficMode"
        :class="{ down: trafficMode === 'monthly' }"
        :title="locale.MonthlyView"
      >
        <inline-svg :src="icoMonth" />
      </span>
      <span
        class="quick-button primary"
        @click="togglePanelSize"
        :class="{ down: panelSize === 'compact' }"
        :title="locale.CompactView"
      >
        <inline-svg :src="icoView" />
      </span>
      <RadioGroup v-model="group" class="group" :options="groups" />
    </div>
    <div class="list" :class="{ compact: panelSize === 'compact' }">
      <div class="scroll-box">
        <ServerPanel
          v-for="server in serverList"
          :key="server.name"
          :info="server"
          :size="panelSize"
          :traffic-mode="trafficMode"
        />
      </div>
    </div>
    <div class="footer">
      <a href="https://github.com/snowie2000/serverstatus-nezha-theme">Nezha theme</a>
      <span>Powered by</span>
      <a href="https://github.com/zdz/ServerStatus-Rust">ServerStatus</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import SummaryCard from '@/components/SummaryCard.vue'
import ServerPanel from '@/components/ServerPanel.vue'
import type { ServerInfo, ServerStat } from '@/typing.d/stat'
import axios from 'axios'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import icoUpload from '@/assets/upload.svg'
import icoDownload from '@/assets/download.svg'
import icoMonth from '@/assets/month.svg'
import icoView from '@/assets/view.svg'
import icoLight from '@/assets/light.svg'
import icoDark from '@/assets/dark.svg'
import { filesize } from 'filesize'
import RadioGroup from '@/components/RadioGroup.vue'
import { useTranslation } from '@/useTranslation'

const locale = useTranslation()
const loading = ref(true)

const group = ref(locale.All)
const serverStats = ref<ServerStat>({ updated: 0, servers: [] })
const time = computed(() => {
  if (serverStats.value.updated) {
    return new Date(serverStats.value.updated * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
  return ''
})

let fetcher = 0
const loadData = () => {
  axios
    .get<ServerStat>('/json/stats.json')
    .then((res) => {
      serverStats.value = res.data
      loading.value = false
    })
    .catch(() => {
      loading.value = true
    })
    .finally(() => {
      fetcher = setTimeout(() => loadData(), 1000)
    })
}

const filterType = ref('none')

// calculate server groups
const groups = ref<string[]>([])

watch(serverStats, (stats) => {
  const ret = [locale.All]
  stats.servers.reduce((acc, cur) => {
    if (!acc.includes(cur.gid)) {
      acc.push(cur.gid)
    }
    return acc
  }, ret)

  if (!arrEqual(ret, groups.value)) {
    groups.value = ret
  }
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
    if (trafficMode.value === 'monthly') {
      acc.total_upload -= cur.last_network_out
      acc.total_download -= cur.last_network_in
    }
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
const trafficMode = ref<'monthly' | 'total'>('monthly')
const colorMode = ref('light')

const serverList = computed(() => {
  let servers: ServerInfo[] = [...serverStats.value.servers]
  switch (group.value) {
    case locale.All:
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
      servers.sort((a, b) => b.network_tx + b.network_rx - a.network_tx - a.network_rx)
      break
  }
  return servers
})

// color scheme setup and monitoring
const colorSchemer = {
  queryList: window.matchMedia('(prefers-color-scheme: dark)'),
  enabled: false,
  update() {
    if (window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        colorMode.value = 'dark'
      } else {
        colorMode.value = 'light'
      }
    }
  },
  enable() {
    this.queryList.addEventListener('change', this.update)
    this.enabled = true
  },
  disable() {
    if (this.enabled) {
      this.queryList.removeEventListener('change', this.update)
      this.enabled = false
    }
  },
}

const togglePanelSize = () => {
  panelSize.value = panelSize.value === 'normal' ? 'compact' : 'normal'
}

const toggleTrafficMode = () => {
  trafficMode.value = trafficMode.value === 'monthly' ? 'total' : 'monthly'
}

const toggleColorMode = () => {
  colorMode.value = colorMode.value === 'light' ? 'dark' : 'light'
  colorSchemer.disable()

  document.body.classList.add('animating')
  setTimeout(() => {
    document.body.classList.remove('animating')
  }, 500)

  if (colorMode.value === 'light') {
    document.body.classList.remove('dark')
    document.body.classList.add('light')
  } else {
    document.body.classList.remove('light')
    document.body.classList.add('dark')
  }
}

onMounted(() => {
  loadData()
  colorSchemer.enable()
  colorSchemer.update()
})

onUnmounted(() => {
  colorSchemer.disable()
  clearTimeout(fetcher)
})

// helpers
function arrEqual(a: unknown[], b: unknown[]) {
  if (a.length === b.length) {
    return a.every((it, i) => it === b[i])
  }
  return false
}
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
      white-space: nowrap;
    }

    .total_download,
    .total_upload {
      white-space: nowrap;
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
    min-width: 920px;
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

  .right-toolbar {
    float: right;
  }
}

.toolbar {
  margin: 20px 0;
  align-items: center;
}

.group {
  vertical-align: middle;
  margin-left: 10px;
}

.network-icon {
  width: 12px;
  margin-right: 2px;
  vertical-align: text-bottom;

  svg {
    fill: var(--color-text);
  }

  & + span {
    vertical-align: middle;
  }
}

.quick-button {
  flex: 0 0 32px;
  display: inline-block;
  width: 32px;
  height: 32px;
  padding: 8px;
  line-height: 16px;
  text-align: center;
  background-color: var(--color-gray);
  border-radius: 50%;
  vertical-align: middle;
  transition: all 0.2s;
  cursor: pointer;
  --fill-color: var(--color-text);

  &.primary {
    --fill-color: #2b7fff;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  & + .quick-button {
    margin-left: 10px;
  }

  svg {
    fill: var(--fill-color);
    height: 16px;
    width: 16px;
  }

  &.down {
    background-color: var(--fill-color);
    svg {
      fill: white;
    }
  }
}

.realtime {
  font-size: 11px;
  line-height: 15px;
  font-weight: 600;

  > * {
    vertical-align: top;
  }
}

.total_upload {
  color: var(--color-bluetext);
  margin-right: 5px;
}

.total_download {
  color: var(--color-purpletext);
}

.upload {
  margin-right: 5px;
}

.total {
  font-size: 14px;
  font-weight: 500;
  word-break: break-all;
  padding-bottom: 5px;
  line-height: 14px;
}

.loader {
  width: 16px;
  height: 16px;
  margin: 0 0 -3px 10px;
  border-radius: 50%;
  display: inline-block;
  border-top: 2px solid var(--color-green-500);
  border-right: 2px solid transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.footer {
  padding: 20px 0 15px 0;
  text-align: center;
  font-size: 13px;

  a {
    color: var(--color-bluetext);
  }

  span {
    margin: 0 5px;
  }
}
</style>
