<template>
  <div class="home-container">
    <div class="welcome-info">
      <h2>{{ greeting }}好！</h2>
    </div>
    <div class="cards  fade-in">
      <div class="card-1" @click="toArticleList">
        <i class="iconfont icon-ar-view"></i>
        <div class="card1-description">随便看看🧐</div>
      </div>
      <div class="card-2" @click="toCreate">
        <i class="iconfont icon-ar-xiezuo"></i>
        <div class="card2-description">开始创作😎</div>
      </div>
      <div class="card-3" @click="toCollection">
        <i class="iconfont icon-ar-tuijian"></i>
        <div class="card3-description">查看收藏🥰</div>
      </div>
      <div class="card-4" @click="toMessage">
        <i class="iconfont icon-ar-algertMsg"></i>
        <div class="card4-description">好友来信🥳</div>
      </div>
    </div>
    <el-container class="statistic" direction="vertical">
      <div class="chart">
        <div>您的创作统计：</div>
        <div id="main" style="width: 600px;height:400px;"></div>
      </div>
      <div v-if="this.show">
        您还没有创作任何文章哦， 试着<router-link to="table/index"
          >找点灵感</router-link
        >？
      </div>
    </el-container>
  </div>
</template>

<script>
import { dateFormatSta } from '@/utils/dateFormat.js'
import { mapGetters } from 'vuex'
export default {
  name: 'Home',
  computed: {
    ...mapGetters(['name'])
  },
  created () {
    this.greetingSet()
  },
  mounted () {
    // this.myEcharts()
    this.getStatistic()
  },
  data () {
    return {
      ptime: [],
      count: [],
      greeting: '',
      show: false
    }
  },
  methods: {
    // 获取以日为单位的创作统计, 异步获取数据再加载图表
    getStatistic () {
      const myChart = this.$echarts.init(document.getElementById('main'))
      const d = new Date()
      const day = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      const week = `${d.getDay()}`
      const uid = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http
        .get(`statistic?date=${day}&week=${week}&uid=${uid}`)
        .then(res => {
          // console.log(res.data)
          if (res.data.length > 0) {
            for (const item of res.data) {
              item.ptime = dateFormatSta(item.ptime).split(' ')[0]
              this.count.push(item.cnt)
              this.ptime.push(item.ptime)
            }
            this.show = false
          } else {
            this.show = true
          }
          // set Echart
          myChart.setOption({
            title: {
              text: '暂无数据',
              left: 'center',
              top: 'center',
              show: this.show
            },
            tooltip: {},
            xAxis: {
              type: 'category',
              data: this.ptime
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                data: this.count,
                type: 'line'
              }
            ]
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 当前时间判断
    greetingSet () {
      const d = new Date()
      const time = d.getHours()
      // console.log(time)
      if (time <= 5 || time > 23) {
        this.greeting = '深夜'
      } else if (time > 5 && time <= 9) {
        this.greeting = '早上'
      } else if (time > 9 && time <= 11) {
        this.greeting = '上午'
      } else if (time > 11 && time <= 13) {
        this.greeting = '中午'
      } else if (time >= 18 && time <= 23) {
        this.greeting = '晚上'
      } else if (time > 13 && time < 18) {
        this.greeting = '下午'
      } else {
        this.greeting = '你'
      }
    },
    toArticleList () {
      this.$router.push('/table/index')
    },
    toCreate () {
      this.$router.push('/form/create')
    },
    toCollection () {
      this.$router.push('/user/collection')
    },
    toMessage () {
      this.$router.push('/user/message')
    }
  }
}
</script>

<style lang="less" scoped>
@card1-bg: #bec4e7af;
@card2-bg: #fadfacbf;
@card3-bg: #bad0d3af;
@card4-bg: #f5bba8af;
.cards {
  float: left;
  width: 400px;
  height: 100%;
  margin-right: 30px;
  /* /deep/ .el-card {
    display: flex;
  } */
  div[class*='card-'] {
    display: flex;
    border-radius: 15px;
    width: 375px;
    height: 120px;
    align-items: center;
    justify-content: space-evenly;
    margin: 10px 0;
    cursor: pointer;
    box-shadow: 0 0 0 1px hsla(240, 0%, 100%, 0.8) inset,
      0 0.2em 0.5em rgba(199, 198, 198, 0.795);
  }
  div[class*='description'] {
    font-size: 1.2rem;
    text-shadow: 0 1px 1px hsla(240, 0%, 100%, 0.5);
    -webkit-box-reflect: below 10px -webkit-gradient(linear, left top, left
          bottom, from(transparent), to(rgba(255, 255, 255, 0.11)));
    /* &:hover {
      animation: bouncingLoader 0.6s alternate;
    } */
  }
  @keyframes bouncingLoader {
    from {
      width: 0.1 rem;
      height: 0.1 rem;
      opacity: 1;
      transform: translate3d(0);
    }
    to {
      width: 1 rem;
      height: 1 rem;
      opacity: 0.1;
      transform: translate3d(0, -1rem, 0);
    }
  }
  .card-1 {
    background-color: @card1-bg;
    border: 3px solid transparent;
    transition: all 0.4s ease;
    &:hover {
      border: 3px solid (@card1-bg+#817b7b11);
    }
  }
  .card-2 {
    border: 3px solid transparent;
    transition: all 0.4s ease;
    background-color: @card2-bg;
    &:hover {
      border: 3px solid (@card2-bg+#817b7b11);
    }
  }
  .card-3 {
    border: 3px solid transparent;
    transition: all 0.4s ease;
    background-color: @card3-bg;
    &:hover {
      border: 3px solid (@card3-bg+#817b7b11);
    }
  }
  .card-4 {
    border: 3px solid transparent;
    transition: all 0.4s ease;
    background-color: @card4-bg;
    &:hover {
      border: 3px solid (@card4-bg+#817b7b11);
    }
  }
  i[class*='iconfont'] {
    font-size: 40px;
    color: #151615af;
  }
}
</style>
