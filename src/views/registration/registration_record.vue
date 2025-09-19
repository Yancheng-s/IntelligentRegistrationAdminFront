<template>
  <div class="container">
    <!-- 头部标题 -->
    <div class="header">
      <h1>
        <i class="el-icon-document-checked"></i>
        <span style="margin-left:10px">窗口退号</span>
      </h1>
    </div>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 搜索区域 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-input v-model="case_number" placeholder="请输入患者病历号" clearable></el-input>
      </el-col>
      <el-col :span="6">
        <el-input v-model="real_name" placeholder="请输入患者姓名" clearable></el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="getWaitPatient(1)" icon="el-icon-search">搜索</el-button>
      </el-col>
    </el-row>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 表格区域 -->
    <el-table
      :data="wait_patient"
      stripe
      border
      highlight-current-row
      :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
    >
      <el-table-column type="index" label="编号" width="80" align="center"></el-table-column>
      <el-table-column prop="case_number" label="患者病历号" align="center"></el-table-column>
      <el-table-column prop="real_name" label="患者姓名" width="120" align="center"></el-table-column>
      <el-table-column prop="gender" label="性别" width="80" align="center"></el-table-column>
      <el-table-column prop="card_number" label="身份证号" width="200" align="center"></el-table-column>
      <el-table-column prop="regist_method" label="付款方式" width="150" align="center"></el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-button 
            type="danger" 
            size="mini" 
            @click="refundMedicalRecord(scope.$index, scope.row)"
            icon="el-icon-delete"
          >退号</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <span>共 {{ totalCount }} 条记录</span>
      <el-pagination
        :page-size="pageSize"
        :total="totalCount"
        :current-page="currentPage"
        @current-change="wait_patient_table_change"
        layout="prev, pager, next, jumper"
        background
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      case_number: '',
      real_name: '',
      pageSize: 10,
      totalCount: 0,
      currentPage: 1,
      employee_id: 1,
      wait_patient: []
    }
  },
  methods: {
    refundMedicalRecord(scope_index, scope_row) {
      this.$confirm(`确定要退号患者 ${this.wait_patient[scope_index].real_name} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let id = this.wait_patient[scope_index].id;
        this.$http.get("http://localhost:8091/refundMedicalRecord?id="+id).then(
          (resp) => {
            this.$message.success('退号患者：'+ this.wait_patient[scope_index]["real_name"]);
            this.getWaitPatient(1);
          }
        )
      }).catch(() => {
        this.$message.info('已取消退号操作');
      });
    },
    wait_patient_table_change(nowPageNumber) {
      this.currentPage = nowPageNumber;
      this.getWaitPatient(nowPageNumber);
    },
    getWaitPatient(nowPageNumber) {
      this.$http.get("http://localhost:8091/getRecordRefundPatient?case_number="+this.case_number
        +"&real_name="+this.real_name
        +"&nowPageNumber="+nowPageNumber
        +"&pageSize="+this.pageSize).then(
        (resp) => {
          this.wait_patient = resp.data.list;
          this.totalCount = resp.data.totalCount;
        }
      )
    }
  },
  mounted() {
    this.getWaitPatient(1);
    console.log();
  }
}
</script>

<style scoped>
.container {
  padding: 24px;
  background-color: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.divider {
  height: 1px;
  background-color: #e4e7ed;
  margin-bottom: 20px;
}

.el-table {
  background-color: #ffffff;
  margin-bottom: 20px;
}

.el-table th {
  font-weight: 600;
}

.el-table td, .el-table th {
  padding: 12px 0;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-button--mini {
  padding: 5px 10px;
  font-size: 12px;
}

.el-button + .el-button {
  margin-left: 10px;
}
</style>