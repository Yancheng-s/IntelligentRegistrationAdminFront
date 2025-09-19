<template>
  <div style="padding: 24px; background-color: #f5f7fa;">
    <!-- 列表页 -->
    <div v-if="!showDetails">
      <!-- 头部标题 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: bold;">患者列表</h1>
      </div>

      <!-- 搜索和过滤 -->
      <div style="background-color: #ffffff; padding: 16px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
          <el-input v-model="searchQuery" placeholder="搜索姓名/病历号/身份证号" style="width: 240px;"></el-input>
          <el-select v-model="filterStatus" placeholder="状态" style="width: 120px;">
            <el-option label="全部状态" value=""></el-option>
            <el-option label="已挂号" value="2"></el-option>
            <el-option label="看诊结束" value="1"></el-option>
            <el-option label="退号" value="4"></el-option>
          </el-select>
          <el-date-picker v-model="startDate" type="date" placeholder="开始日期" style="width: 140px;"></el-date-picker>
          <el-date-picker v-model="endDate" type="date" placeholder="结束日期" style="width: 140px;"></el-date-picker>
          <el-button type="primary" @click="fetchRegisterList">查询</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="paginatedPatients" border style="width: 100%">
      <el-table-column prop="case_number" label="病历号" width="150"></el-table-column>
      <el-table-column prop="real_name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="age" label="年龄" width="100"></el-table-column>
      <el-table-column prop="deptment_id" label="科室" width="120"></el-table-column>
      <el-table-column prop="employee_id" label="医生" width="120"></el-table-column>
      <el-table-column prop="visit_date" label="就诊时间" width="160">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.visit_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="visit_state" label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.visit_state)">
            {{ getVisitStateText(scope.row.visit_state) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="card_number" label="身份证号" width="180"></el-table-column>
      <el-table-column prop="home_address" label="地址" width="200"></el-table-column>
      <el-table-column prop="regist_method" label="支付方式" width="100"></el-table-column>
      <el-table-column prop="is_book" label="病历本" width="80">
        <template slot-scope="scope">
          {{ scope.row.is_book === '是' ? '需要' : '不需要' }}
        </template>
      </el-table-column>
      <el-table-column prop="noon" label="午别" width="80"></el-table-column>
      <el-table-column prop="regist_money" label="挂号费" width="80"></el-table-column>
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewDetails(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

      <!-- 分页 -->
      <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
        <el-select v-model="pageSize" style="width: 120px;">
          <el-option label="10条/页" value="10"></el-option>
          <el-option label="20条/页" value="20"></el-option>
          <el-option label="30条/页" value="30"></el-option>
          <el-option label="50条/页" value="50"></el-option>
        </el-select>
        <el-pagination
          layout="prev, pager, next"
          :total="totalPatients"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="changePage"
        ></el-pagination>
      </div>
    </div>
    
    <!-- 详情页 -->
    <div v-else class="patient-detail-content" style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <!-- 顶部导航 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1 style="font-size: 20px; font-weight: bold;">患者信息</h1>
        <el-button @click="handleBack">返回列表</el-button>
      </div>

      <!-- 状态与操作 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <el-tag :type="getStatusTagType(patientInfo.visit_state)">
          {{ getVisitStateText(patientInfo.visit_state) }}
        </el-tag>
        <div style="display: flex; gap: 10px;">
          <el-button @click="handlePrint">下载</el-button>
        </div>
      </div>

      <!-- 基本信息 -->
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px;">基本信息</h2>
      <div style="display: flex; gap: 40px; margin-bottom: 24px;">
        <div style="flex: 1;">
          <p><span style="color: #666; width: 80px; display: inline-block;">病历号：</span>{{ patientInfo.case_number }}</p>
          <p><span style="color: #666; width: 80px; display: inline-block;">姓名：</span>{{ patientInfo.real_name }}</p>
          <p><span style="color: #666; width: 80px; display: inline-block;">年龄：</span>{{ patientInfo.age }}</p>
        </div>
        <div style="flex: 1;">
          <p><span style="color: #666; width: 80px; display: inline-block;">身份证号：</span>{{ patientInfo.card_number }}</p>
          <p><span style="color: #666; width: 80px; display: inline-block;">出生日期：</span>{{ formatDate(patientInfo.birthday) }}</p>
          <p><span style="color: #666; width: 80px; display: inline-block;">家庭住址：</span>{{ patientInfo.home_address }}</p>
        </div>
      </div>

      <!-- 就诊信息 -->
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px;">就诊信息</h2>
<div style="display: flex; gap: 40px; margin-bottom: 24px;">
  <div style="flex: 1;">
    <p><span style="color: #666; width: 80px; display: inline-block;">就诊时间：</span>{{ formatDateTime(patientInfo.visit_date) }}</p>
    <p><span style="color: #666; width: 80px; display: inline-block;">午别：</span>{{ patientInfo.noon }}</p>
    <p><span style="color: #666; width: 80px; display: inline-block;">科室：</span>{{ patientInfo.deptment_id }}</p>
  </div>
  <div style="flex: 1;">
    <p><span style="color: #666; width: 80px; display: inline-block;">挂号级别：</span>{{ getRegistLevel(patientInfo.regist_level_id) }}</p>
    <p><span style="color: #666; width: 80px; display: inline-block;">结算类别：</span>{{ getSettleCategory(patientInfo.settle_category_id) }}</p>
    <p><span style="color: #666; width: 80px; display: inline-block;">主治医生：</span>{{ patientInfo.employee_id }}</p>
  </div>
</div>

      <!-- 支付信息 -->
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px;">支付信息</h2>
      <div style="display: flex; gap: 40px;">
        <div style="flex: 1;">
          <p><span style="color: #666; width: 80px; display: inline-block;">支付方式：</span>{{ patientInfo.regist_method }}</p>
          <p><span style="color: #666; width: 80px; display: inline-block;">挂号费：</span>{{ patientInfo.regist_money }}</p>
        </div>
        <div style="flex: 1;">
          <p><span style="color: #666; width: 80px; display: inline-block;">病历本：</span>{{ patientInfo.is_book === '是' ? '需要' : '不需要' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDetails: false,
      searchQuery: '',
      filterStatus: '',
      startDate: '',
      endDate: '',
      currentPage: 1,
      pageSize: 10,
      patientInfo: {},
      patientsList: []
    };
  },
  computed: {
    filteredPatients() {
      return this.patientsList.filter(patient => {
        const matchesSearch = this.searchQuery ? 
          patient.real_name.includes(this.searchQuery) || 
          patient.case_number.includes(this.searchQuery) || 
          patient.card_number.includes(this.searchQuery) : true;

        const matchesStatus = this.filterStatus ? 
          patient.visit_state && patient.visit_state.toString() === this.filterStatus : true;

        let matchesDate = true;
        if (this.startDate && this.endDate) {
          const visitDate = new Date(patient.visit_date);
          const start = new Date(this.startDate);
          const end = new Date(this.endDate);
          matchesDate = visitDate >= start && visitDate <= end;
        }

        return matchesSearch && matchesStatus && matchesDate;
      });
    },
    totalPatients() {
      return this.filteredPatients.length;
    },
    paginatedPatients() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredPatients.slice(start, end);
    }
  },
  methods: {
    // 获取挂号查询列表
    fetchRegisterList() {
      const params = {};
      if (this.searchQuery) params.realName = this.searchQuery;
      if (this.filterStatus) params.visitState = this.filterStatus;
      if (this.startDate) params.startDate = this.startDate;
      if (this.endDate) params.endDate = this.endDate;

      this.$http.get('http://localhost:8091/getRegisterList', { params })
        .then(res => {
          this.patientsList = res.data || [];
          this.currentPage = 1;
        })
        .catch(() => {
          this.$message.error('查询失败');
        });
    },
    viewDetails(patient) {
      this.patientInfo = { ...patient };
      this.showDetails = true;
    },
    handleBack() {
      this.showDetails = false;
    },
    handlePrint() {
  // 下载患者详情为PDF
  import('html2pdf.js').then(html2pdf => {
    const element = document.querySelector('.patient-detail-content');
    if (element) {
      html2pdf.default().from(element).set({
        margin: 0.5,
        filename: `${this.patientInfo.real_name || '患者'}-病历详情.pdf`,
        html2canvas: { scale: 2 }
      }).save();
    } else {
      this.$message.error('未找到详情内容');
    }
  });
},
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : d.toLocaleString('zh-CN');
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString('zh-CN');
    },
    getRegistLevel(id) {
      const map = { 1: '普通门诊', 2: '专家门诊', 3: '特需门诊' };
      return map[id] || id || '未知级别';
    },
    getSettleCategory(id) {
      const map = { 1: '医保', 2: '自费', 3: '商业保险' };
      return map[id] || id || '未知类别';
    },
    getVisitStateText(state) {
      const map = { 1: '看诊结束', 2: '已挂号', 4: '退号' };
      return map[state] || state || '未知状态';
    },
    getStatusTagType(state) {
      switch (state) {
        case 1: return 'primary';
        case 2: return 'warning';
        case 3: return 'success';
        case 4: return 'info';
        default: return 'default';
      }
    },
    changePage(page) {
      this.currentPage = page;
    }
  },
  mounted() {
    this.fetchRegisterList();
  }
};
</script>

<style scoped>
.el-table {
  background-color: #ffffff;
}
</style>