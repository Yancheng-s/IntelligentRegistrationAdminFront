<template>
  <div style="padding: 24px; background-color: #f5f7fa; min-height: 0vh;">
    <!-- 数据卡片 -->
    <el-row :gutter="20" style="margin-bottom: 30px;">
      <el-col :span="6" v-for="(card, index) in dataCards" :key="index">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{ card.title }}</span>
            <i :class="['fas', card.icon, card.iconColor]" style="float: right; margin-top: 4px;"></i>
          </div>
          <div>
            <h2 style="font-size: 28px; font-weight: bold;">{{ card.value }}</h2>
            <span :class="['ml-2 text-sm', card.trend > 0 ? 'text-green-500' : 'text-red-500']">
              <i :class="['fas', card.trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
              {{ Math.abs(card.trend) }}%
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-bottom: 30px;">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>热门科室排行</span>
          </div>
          <div ref="popularDepartmentChart" style="width: 100%; height: 400px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>就诊时段分布</span>
          </div>
          <div ref="timeDistributionChart" style="width: 100%; height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  data() {
    return {
      dataCards: [
        {
          title: '今日挂号总人数',
          value: '0',
          trend: 0,
          icon: 'fa-user-plus',
          iconColor: 'text-blue-500'
        },
        {
          title: '今日退号数量',
          value: '0',
          trend: 0,
          icon: 'fa-user-minus',
          iconColor: 'text-red-500'
        },
        {
          title: '实际就诊人数',
          value: '0',
          trend: 0,
          icon: 'fa-user-check',
          iconColor: 'text-green-500'
        },
        {
          title: '在线预约率',
          value: '0%',
          trend: 0,
          icon: 'fa-chart-line',
          iconColor: 'text-purple-500'
        }
      ]
    };
  },
  mounted() {
    this.fetchRegisterRecords();
    this.initCharts();
  },
  methods: {
    // 获取挂号数据
    fetchRegisterRecords() {
      this.$http
        .get('http://localhost:8091/getTodayRegisterRecords')
        .then((response) => {
          const records = response.data;

          // 今日数据
          const today = new Date().toISOString().split('T')[0];
          const todayRecords = records.filter((record) =>
            record.visit_date.startsWith(today)
          );
          const totalToday = todayRecords.length;
          const canceledToday = todayRecords.filter(
            (record) => record.visit_state === 4
          ).length;
          const actualToday = totalToday - canceledToday;
          const onlineRateToday = totalToday
            ? ((actualToday / totalToday) * 100).toFixed(1)
            : 0;

          // 昨日数据
          const yesterday = new Date(
            new Date().setDate(new Date().getDate() - 1)
          )
            .toISOString()
            .split('T')[0];
          const yesterdayRecords = records.filter((record) =>
            record.visit_date.startsWith(yesterday)
          );
          const totalYesterday = yesterdayRecords.length;
          const canceledYesterday = yesterdayRecords.filter(
            (record) => record.visit_state === 4
          ).length;
          const actualYesterday = totalYesterday - canceledYesterday;
          const onlineRateYesterday = totalYesterday
            ? ((actualYesterday / totalYesterday) * 100).toFixed(1)
            : 0;

          // 更新数据卡片
          this.dataCards[0].value = totalToday;
          this.dataCards[0].trend = totalYesterday
            ? (((totalToday - totalYesterday) / totalYesterday) * 100).toFixed(1)
            : 0;

          this.dataCards[1].value = canceledToday;
          this.dataCards[1].trend = canceledYesterday
            ? (
                ((canceledToday - canceledYesterday) / canceledYesterday) *
                100
              ).toFixed(1)
            : 0;

          this.dataCards[2].value = actualToday;
          this.dataCards[2].trend = actualYesterday
            ? (((actualToday - actualYesterday) / actualYesterday) * 100).toFixed(
                1
              )
            : 0;

          this.dataCards[3].value = `${onlineRateToday}%`;
          this.dataCards[3].trend = onlineRateYesterday
            ? (onlineRateToday - onlineRateYesterday).toFixed(1)
            : 0;

          // 更新就诊时段分布图
          this.updateTimeDistributionChart(todayRecords);
        })
        .catch((error) => {
          console.error('获取挂号数据失败:', error);
          this.$message.error('获取挂号数据失败');
        });
    },

    // 初始化图表
    initCharts() {
      this.departmentChart = echarts.init(this.$refs.popularDepartmentChart);
      this.timeChart = echarts.init(this.$refs.timeDistributionChart);

      const departmentOption = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: ['心内科', '神经内科', '消化内科', '呼吸内科', '骨科', '妇产科', '儿科', '皮肤科']
        },
        series: [
          {
            name: '就诊人数',
            type: 'bar',
            data: [320, 285, 275, 260, 245, 230, 215, 200],
            itemStyle: { color: '#3B82F6' }
          }
        ]
      };

      this.departmentChart.setOption(departmentOption);
    },

    // 更新就诊时段分布图
    updateTimeDistributionChart(todayRecords) {
      // 构造24小时时间段
      const timeSlots = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' : '') + i + ':00');
      const timeData = timeSlots.map((slot) =>
        todayRecords.filter((record) => {
          // 提取小时部分
          const match = record.visit_date.match(/T(\d{2}):/);
          if (match) {
            return match[1] + ':00' === slot;
          }
          // 兼容没有T的情况
          const hour = record.visit_date.slice(11, 13);
          return hour + ':00' === slot;
        }).length
      );

      const timeOption = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: timeSlots
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '就诊人数',
            type: 'line',
            smooth: true,
            data: timeData,
            itemStyle: { color: '#3B82F6' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
                ]
              }
            }
          }
        ]
      };

      this.timeChart.setOption(timeOption);
    }
  }
};
</script>

<style scoped>
.box-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.text-blue-500 {
  color: #409EFF;
}
.text-red-500 {
  color: #f56c6c;
}
.text-green-500 {
  color: #67c23a;
}
.text-purple-500 {
  color: #e6a23c;
}
.ml-2 {
  margin-left: 8px;
}
.text-sm {
  font-size: 12px;
}
</style>