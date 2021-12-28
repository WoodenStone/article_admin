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
        <div id="main"></div>
      </div>
      <div v-if="this.show" class="none-info">
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
      show: false,
      option: {}
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
          // console.log(res)
          if (res.data.length > 0) {
            // 格式化时间
            for (const item of res.data) {
              item.ptime = dateFormatSta(item.ptime)
                .split(' ')[0]
                .slice(0, -1)
              this.count.push(item.cnt)
              this.ptime.push(item.ptime)
            }
            this.show = false
          } else {
            this.show = true
          }
          // set Echart
          /* myChart.setOption({
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
          }) */
          myChart.setOption(
            (this.option = {
              /* title: {
                text: '创作统计',
                left: '1%'
              }, */
              tooltip: {
                trigger: 'axis'
              },
              grid: {
                left: '5%',
                right: '15%',
                bottom: '10%'
              },
              xAxis: {
                data: this.ptime
              },
              yAxis: {},
              toolbox: {
                right: 10,
                feature: {
                  dataZoom: {
                    yAxisIndex: 'none'
                  },
                  restore: {},
                  saveAsImage: {}
                }
              },
              dataZoom: [
                {
                  startValue: this.ptime[0]
                },
                {
                  type: 'inside'
                }
              ],
              visualMap: {
                top: 50,
                right: 10,
                pieces: [
                  {
                    gt: 0,
                    lte: 2,
                    color: '#41a273'
                  },
                  {
                    gt: 2,
                    lte: 5,
                    color: '#79c0dd'
                  },
                  {
                    gt: 5,
                    lte: 7,
                    color: '#ea6667'
                  },
                  {
                    gt: 7,
                    lte: 10,
                    color: '#f7c85e'
                  },
                  {
                    gt: 10,
                    color: '#5a70c4'
                  }
                ],
                outOfRange: {
                  color: '#9a60b3'
                }
              },
              series: {
                name: 'writings: ',
                type: 'line',
                data: this.count,
                markLine: {
                  silent: true,
                  lineStyle: {
                    color: '#333'
                  },
                  data: [
                    {
                      yAxis: 50
                    },
                    {
                      yAxis: 100
                    },
                    {
                      yAxis: 150
                    },
                    {
                      yAxis: 200
                    },
                    {
                      yAxis: 300
                    }
                  ]
                }
              }
            })
          )
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
.welcome-info {
  margin-left: 3rem;
}
#main {
  width: 45rem;
  height: 25rem;
}
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
    margin: 1rem 0;
    margin-left: 3rem;
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
    font-size: 45px;
    color: #151615af;
  }
}
.statistic {
  align-items: center;
  .chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
