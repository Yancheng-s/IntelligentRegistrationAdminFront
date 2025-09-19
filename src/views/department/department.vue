<template>
  <div style="padding: 24px; background-color: #f5f7fa;">
    <!-- 头部标题 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="font-size: 20px; font-weight: bold;">科室管理</h1>
      <el-button type="primary" @click="openModal('add')">
        <i class="el-icon-plus"></i>
        <span>新增科室</span>
      </el-button>
    </div>

    <!-- 查询条件 -->
    <el-form :inline="true" style="margin-bottom: 20px;">
      <el-form-item label="科室编号">
        <el-input v-model="searchParams.deptId" placeholder="请输入科室编号"></el-input>
      </el-form-item>
      <el-form-item label="科室名称">
        <el-input v-model="searchParams.deptName" placeholder="请输入科室名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchDepartments">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="departments" border style="width: 100%">
      <el-table-column prop="dept_code" label="科室编号" width="150"></el-table-column>
      <el-table-column prop="dept_name" label="科室名称"></el-table-column>
      <el-table-column prop="dept_type" label="科室类型" width="160"></el-table-column>
      <el-table-column prop="strong_point" label="擅长领域"></el-table-column>
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
    <el-dialog :title="modalMode === 'add' ? '新增科室' : '编辑科室'" :visible.sync="showModal" width="40%">
      <el-form :model="formData" label-width="100px" :rules="rules" ref="form">
        <el-form-item label="科室编号" prop="dept_code">
          <el-input v-model="formData.dept_code" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="科室名称" prop="dept_name">
          <el-input v-model="formData.dept_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="科室类型" prop="dept_type">
          <el-input v-model="formData.dept_type" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="擅长领域" prop="strong_point">
          <el-input v-model="formData.strong_point" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showModal = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog title="删除科室" :visible.sync="showDeleteConfirm" width="30%">
      <span>确定要删除科室 {{ currentDept && currentDept.dept_name }} 吗？此操作无法撤销。</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDeleteConfirm = false">取消</el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      departments: [], // 科室数据
      total: 0, // 总记录数
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页显示条数
      searchParams: {
        deptId: '', // 查询条件：科室编号
        deptName: '' // 查询条件：科室名称
      },
      showModal: false, // 控制新增/编辑弹窗显示
      modalMode: 'add', // 弹窗模式：add 或 edit
      formData: {
        dept_code: '',
        dept_name: '',
        dept_type: '',
        strong_point: ''
      }, // 表单数据
      rules: {
        dept_code: [{ required: true, message: '请输入科室编号', trigger: 'blur' }],
        dept_name: [{ required: true, message: '请输入科室名称', trigger: 'blur' }],
        dept_type: [{ required: true, message: '请输入科室类型', trigger: 'blur' }],
        strong_point: [{ required: true, message: '请输入擅长领域', trigger: 'blur' }]
      },
      showDeleteConfirm: false, // 控制删除确认弹窗显示
      currentDept: null // 当前选中的科室
    };
  },
  mounted() {
    this.fetchDepartments();
  },
  methods: {
    // 获取科室数据
    fetchDepartments() {
      const params = {
        nowPageNumber: this.currentPage,
        pageSize: this.pageSize,
        deptId: this.searchParams.deptId || undefined,
        deptName: this.searchParams.deptName || undefined
      };

      this.$http
        .get('http://localhost:8091/getDeptListByPage', { params })
        .then((response) => {
          const data = response.data;
          this.departments = data.list || [];
          this.total = data.totalCount || 0;
        })
        .catch((error) => {
          console.error('获取科室数据失败:', error);
          this.$message.error('获取科室数据失败');
        });
    },

    // 重置查询条件
    resetSearch() {
      this.searchParams.deptId = '';
      this.searchParams.deptName = '';
      this.fetchDepartments();
    },

    // 分页切换
    changePage(page) {
      this.currentPage = page;
      this.fetchDepartments();
    },

    // 打开新增/编辑弹窗
    openModal(mode, dept) {
      this.modalMode = mode;
      if (mode === 'edit' && dept) {
        this.formData = { ...dept };
      } else {
        this.formData = {
          dept_code: '',
          dept_name: '',
          dept_type: '',
          strong_point: ''
        };
      }
      this.showModal = true;
    },

    // 提交新增/编辑数据
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;

        if (this.modalMode === 'add') {
          // 新增科室
          this.$http
            .post('http://localhost:8091/addDepartment', this.formData)
            .then(() => {
              this.$message.success('新增科室成功');
              this.showModal = false;
              this.fetchDepartments();
            })
            .catch((error) => {
              console.error('新增科室失败:', error);
              this.$message.error('新增科室失败');
            });
        } else {
          // 编辑科室
          this.$http
            .put('http://localhost:8091/updateDepartment', this.formData)
            .then(() => {
              this.$message.success('编辑科室成功');
              this.showModal = false;
              this.fetchDepartments();
            })
            .catch((error) => {
              console.error('编辑科室失败:', error);
              this.$message.error('编辑科室失败');
            });
        }
      });
    },

    // 确认删除
    confirmDelete(dept) {
      this.currentDept = dept;
      this.showDeleteConfirm = true;
    },

    // 删除科室
    handleDelete() {
      if (!this.currentDept) return;

      this.$http
        .delete(`http://localhost:8091/deleteDepartment/${this.currentDept.dept_code}`)
        .then(() => {
          this.$message.success('删除科室成功');
          this.showDeleteConfirm = false;
          this.fetchDepartments();
        })
        .catch((error) => {
          console.error('删除科室失败:', error);
          this.$message.error('删除科室失败');
        });
    }
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