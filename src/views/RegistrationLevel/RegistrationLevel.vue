<template>
  <div style="padding: 24px; background-color: #f5f7fa;">
    <!-- 头部标题 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="font-size: 20px; font-weight: bold;">挂号级别管理</h1>
      <el-button type="primary" @click="openModal('add')">
        <i class="el-icon-plus"></i>
        <span>新增级别</span>
      </el-button>
    </div>

    <!-- 搜索框 -->
    <div style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
      <el-input v-model="searchKeyword" placeholder="搜索级别名称" style="width: 300px;"></el-input>
    </div>

    <!-- 表格 -->
    <el-table :data="filteredList" border style="width: 100%">
      <el-table-column prop="id" label="级别编号" width="120"></el-table-column>
      <el-table-column prop="name" label="级别名称"></el-table-column>
      <el-table-column prop="fee" label="挂号费用" width="120">
        <template slot-scope="scope">¥ {{ scope.row.fee }}</template>
      </el-table-column>
      <el-table-column prop="description" label="级别说明"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="mini" @click="openModal('edit', scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
      <span>共 {{ totalItems }} 条记录</span>
      <el-pagination
        layout="prev, pager, next"
        :total="totalItems"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="changePage"
      ></el-pagination>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="modalMode === 'add' ? '新增级别' : '编辑级别'" :visible.sync="showModal" width="40%">
      <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="级别名称" prop="name">
          <el-input v-model="formData.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="挂号费用" prop="fee">
          <el-input-number v-model="formData.fee" :min="0" :step="0.01" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="级别说明" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showModal = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog title="删除级别" :visible.sync="showDeleteConfirm" width="30%">
      <span>确定要删除该级别吗？此操作无法撤销。</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDeleteConfirm = false">取 消</el-button>
        <el-button type="danger" @click="handleDelete">删 除</el-button>
      </div>
    </el-dialog>

    <!-- 提示 Toast -->
    <el-alert
      v-if="showToast"
      :title="toastMessage"
      type="success"
      :closable="false"
      show-icon
      style="position: fixed; top: 20px; right: 20px; width: 300px;"
    ></el-alert>
  </div>
</template>

<script>
export default {
  data() {
    return {
      registLevelList: [
        { id: 1, name: '普通门诊', fee: 20, description: '普通门诊挂号，适用于常见病症诊治', createTime: '2024-01-15 09:00:00' },
        { id: 2, name: '专家门诊', fee: 50, description: '专家级别医师诊疗服务，适用于疑难杂症', createTime: '2024-01-15 09:30:00' },
        { id: 3, name: '特需门诊', fee: 100, description: '特需门诊服务，提供更专业的医疗咨询和诊治方案', createTime: '2024-01-15 10:00:00' },
        { id: 4, name: '急诊', fee: 30, description: '急诊服务，24小时接诊，适用于急危重症', createTime: '2024-01-15 10:30:00' }
      ],
      showModal: false,
      showDeleteConfirm: false,
      modalMode: 'add',
      formData: { id: 0, name: '', fee: 0, description: '' },
      currentLevel: null,
      showToast: false,
      toastMessage: '',
      currentPage: 1,
      pageSize: 10,
      searchKeyword: '',
      rules: {
        name: [{ required: true, message: '请输入级别名称', trigger: 'blur' }],
        fee: [{ required: true, message: '请输入挂号费用', trigger: 'blur' }]
      }
    };
  },
  computed: {
    filteredList() {
      const filtered = this.registLevelList.filter(item =>
        item.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return filtered.slice(start, end);
    },
    totalItems() {
      return this.registLevelList.length;
    }
  },
  methods: {
    openModal(mode, level) {
      this.modalMode = mode;
      if (mode === 'edit' && level) {
        this.formData = { ...level };
      } else {
        this.formData = { id: 0, name: '', fee: 0, description: '' };
      }
      this.showModal = true;
    },
    handleSubmit() {
      if (!this.formData.name || !this.formData.fee) {
        this.$message.error('请填写完整信息');
        return;
      }

      if (this.modalMode === 'add') {
        const newId = Math.max(...this.registLevelList.map(i => i.id)) + 1;
        this.registLevelList.push({
          ...this.formData,
          id: newId,
          createTime: new Date().toLocaleString()
        });
        this.showToastMessage('新增级别成功');
      } else {
        const index = this.registLevelList.findIndex(i => i.id === this.formData.id);
        if (index !== -1) {
          this.registLevelList[index] = { ...this.formData };
          this.showToastMessage('编辑级别成功');
        }
      }

      this.showModal = false;
      this.loadPage();
    },
    confirmDelete(level) {
      this.currentLevel = level;
      this.showDeleteConfirm = true;
    },
    handleDelete() {
      if (this.currentLevel) {
        const index = this.registLevelList.findIndex(i => i.id === this.currentLevel.id);
        if (index !== -1) {
          this.registLevelList.splice(index, 1);
          this.showToastMessage('删除级别成功');
        }
      }
      this.showDeleteConfirm = false;
      this.loadPage();
    },
    loadPage() {
      this.currentPage = 1;
    },
    changePage(page) {
      this.currentPage = page;
    },
    showToastMessage(message) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
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