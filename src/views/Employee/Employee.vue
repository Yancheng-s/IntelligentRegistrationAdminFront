<template>
  <div style="padding: 24px; background-color: #f5f7fa;">
    <!-- 头部标题 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="font-size: 20px; font-weight: bold;">医生管理</h1>
      <el-button type="primary" @click="openModal('add')">
        <i class="el-icon-plus"></i>
        <span>新增医生</span>
      </el-button>
    </div>

    <!-- 搜索 -->
    <div style="margin-bottom: 20px; display: flex; gap: 16px; align-items: center;">
      <el-input v-model="searchName" placeholder="输入医生姓名" style="width: 240px;"></el-input>
      <el-button type="primary" @click="fetchDoctors">查询</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="displayedDoctors" border style="width: 100%">
      <el-table-column prop="realname" label="姓名" width="120"></el-table-column>
      <el-table-column prop="regist_level_id" label="号别" width="100"></el-table-column>
      <el-table-column prop="rule_name" label="排班规则"></el-table-column>
      <el-table-column label="排班情况" width="120">
        <template slot-scope="scope">
          <el-tag :type="getScheduleStatus(scope.row) === '在岗' ? 'success' : 'info'">
            {{ getScheduleStatus(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="mini" @click="openModal('edit', scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
      <span>共 {{ total }} 条记录</span>
      <el-pagination
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="changePage"
      ></el-pagination>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="modalMode === 'add' ? '新增医生' : '编辑医生'" :visible.sync="showModal" width="40%">
      <el-form :model="doctorForm" label-width="100px" :rules="rules" ref="form">
        <el-form-item label="姓名" prop="realname">
          <el-input v-model="doctorForm.realname"></el-input>
        </el-form-item>
        <el-form-item label="号别" prop="regist_level_id">
          <el-input v-model="doctorForm.regist_level_id"></el-input>
        </el-form-item>
        <el-form-item label="排班规则" prop="rule_name">
          <el-input v-model="doctorForm.rule_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showModal = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog title="删除医生" :visible.sync="showDeleteConfirm" width="30%">
      <span>确定要删除该医生吗？此操作无法撤销。</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDeleteConfirm = false">取 消</el-button>
        <el-button type="danger" @click="handleDelete">删 除</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      doctors: [],
      searchName: '',
      showModal: false,
      showDeleteConfirm: false,
      modalMode: 'add',
      doctorForm: {
        realname: '',
        regist_level_id: '',
        rule_name: ''
      },
      currentPage: 1,
      pageSize: 10,
      rules: {
        realname: [{ required: true, message: '请输入医生姓名', trigger: 'blur' }],
        regist_level_id: [{ required: true, message: '请输入号别', trigger: 'blur' }],
        rule_name: [{ required: true, message: '请输入排班规则', trigger: 'blur' }]
      },
      currentDoctor: null
    };
  },
  computed: {
    displayedDoctors() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.doctors.slice(start, end);
    },
    total() {
      return this.doctors.length;
    }
  },
  methods: {
    // 获取医生列表
    fetchDoctors() {
      let url = 'http://localhost:8091/getDoctorListWithRegistName';
      let params = {};
      if (this.searchName) {
        params.realname = this.searchName;
      }
      this.$http.get(url, { params })
        .then(res => {
          this.doctors = res.data || [];
          this.currentPage = 1;
        })
        .catch(() => {
          this.$message.error('查询失败');
        });
    },
    // 判断排班情况
      getScheduleStatus(row) {
      const now = new Date();
      const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
      const weekStr = weekMap[now.getDay()];
      const hour = now.getHours();
      const timeStr = hour < 12 ? '上午' : '下午';

      if (!row.rule_name) return '休假';

      // 支持“星期一三五上午”、“星期二四六下午”、“周六周日全天”
      // 先判断“全天”
      if (row.rule_name.includes('全天')) {
        // 判断今天是否在“周六周日”或“星期六日”等
        const match = row.rule_name.match(/(星期|周)([\u4e00-\u9fa5]+)/);
        if (match) {
          const weeks = match[2].replace(/[、 ,，]/g, '').split('');
          if (weeks.includes(weekStr)) {
            return '在岗';
          }
        }
      } else {
        // 判断上午/下午
        const match = row.rule_name.match(/(星期|周)([\u4e00-\u9fa5]+)(上午|下午)/);
        if (match) {
          const weeks = match[2].replace(/[、 ,，]/g, '').split('');
          const period = match[3];
          if (weeks.includes(weekStr) && period === timeStr) {
            return '在岗';
          }
        }
      }
      return '休假';
    },
    openModal(mode, doctor = {}) {
      this.modalMode = mode;
      if (mode === 'edit') {
        this.doctorForm = { ...doctor };
      } else {
        this.doctorForm = {
          realname: '',
          regist_level_id: '',
          rule_name: ''
        };
      }
      this.showModal = true;
    },
    handleSubmit() {
      // 新增/编辑逻辑略
      this.showModal = false;
    },
    confirmDelete(doctor) {
      this.currentDoctor = doctor;
      this.showDeleteConfirm = true;
    },
    handleDelete() {
      // 删除逻辑略
      this.showDeleteConfirm = false;
    },
    changePage(page) {
      this.currentPage = page;
    }
  },
  mounted() {
    this.fetchDoctors();
  }
};
</script>

<style scoped>
.el-table {
  background-color: #ffffff;
}
.dialog-footer {
  text-align: right;
}
</style>