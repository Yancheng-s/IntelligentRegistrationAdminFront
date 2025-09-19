<template>
  <div>
    <el-divider></el-divider>
    <div style="font-size:20px;text-align:left">
      <i class="el-icon-document-checked">窗口挂号</i>
    </div>
    <el-divider></el-divider>
    <div style="text-align:left">
      <el-button type="primary" @click="addNewRegist()">挂号</el-button>
      <el-button type="primary" @click="clearRegist()">清空</el-button>
    </div>

    <el-descriptions title="基本信息" :column="3" border style="margin-top:20px">
      <el-descriptions-item label="病历号">
        <el-input v-model="register.case_number" placeholder="请输入病历号"></el-input>
      </el-descriptions-item>
      <el-descriptions-item label="姓名">
        <el-input v-model="register.real_name" placeholder="请输入姓名"></el-input>
      </el-descriptions-item>
      <el-descriptions-item label="性别">
        <el-select v-model="register.gender" placeholder="请选择">
          <el-option label="男" value="男"></el-option>
          <el-option label="女" value="女"></el-option>
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item label="身份证号">
        <el-input v-model="register.card_number" placeholder="请输入身份证号"></el-input>
      </el-descriptions-item>
      <el-descriptions-item label="出生日期">
        <el-date-picker v-model="register.birthday" type="date" placeholder="选择日期" value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-descriptions-item>
      <el-descriptions-item label="年龄">
        <div class="age-input-container">
          <el-input 
            v-model="register.age" 
            placeholder="自动计算" 
            disabled
            class="age-input"
          ></el-input>
          <el-select 
            v-model="register.age_type" 
            placeholder="类型" 
            disabled
            class="age-type-select"
          >
            <el-option label="年" value="年"></el-option>
            <el-option label="日" value="日"></el-option>
          </el-select>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="家庭住址">
        <el-input v-model="register.home_address" placeholder="请输入家庭住址"></el-input>
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="挂号信息" :column="3" border style="margin-top:20px">
      <el-descriptions-item label="看诊日期">
        <el-date-picker v-model="register.visit_date" type="datetime" placeholder="选择日期时间" value-format="yyyy-MM-dd HH:mm:ss">
        </el-date-picker>
      </el-descriptions-item>
      
      <!-- 隐藏原来的午别选择 -->
      <el-descriptions-item label="午别" v-if="false">
        <el-select v-model="register.noon" placeholder="请选择">
          <el-option label="上午" value="AM"></el-option>
          <el-option label="下午" value="PM"></el-option>
        </el-select>
      </el-descriptions-item>
      
      <el-descriptions-item label="挂号科室">
        <el-select
          v-model="register.department_id"
          filterable
          remote
          reserve-keyword
          placeholder="请输入科室名称搜索"
          :remote-method="remoteMethod"
          :loading="loading"
          @change="handleDepartmentChange"
        >
          <el-option
            v-for="item in filteredDepartments"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span style="float: left">{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-descriptions-item>
      
      <!-- 修改后的排班时间选择 -->
      <el-descriptions-item label="排班时间">
        <el-select 
          v-model="register.scheduling_time" 
          placeholder="请选择排班时间" 
          @change="loadDoctors"
          style="width: 200px"
        >
          <el-option 
            v-for="item in schedulingOptions" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value"
          >
            {{ item.label }}
          </el-option>
        </el-select>
      </el-descriptions-item>
      
      <el-descriptions-item label="医生">
        <el-select 
          v-model="register.employee_id" 
          placeholder="请先选择科室和排班时间"
          :disabled="!register.department_id || !register.scheduling_time"
          style="width: 250px"
        >
          <el-option 
            v-for="doctor in register_employee" 
            :key="doctor.id" 
            :label="doctor.realname" 
            :value="doctor.id"
          >
            <span>{{ doctor.realname }} - {{ doctor.registLevelId | formatTitle }}</span>
          </el-option>
        </el-select>
      </el-descriptions-item>
      
      <el-descriptions-item label="号别">
        <el-select v-model="register.regist_level_id" placeholder="请选择">
          <el-option v-for="item in register_level" :key="item.id" :label="item.regist_name" :value="item.id">
          </el-option>
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item label="结算类别">
        <el-select v-model="register.settle_category_id" placeholder="请选择">
          <el-option v-for="item in register_settle" :key="item.id" :label="item.settle_name" :value="item.id">
          </el-option>
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item label="病历本">
        <el-select v-model="register.is_book" placeholder="请选择">
          <el-option label="是" value="是"></el-option>
          <el-option label="否" value="否"></el-option>
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item label="收费方式">
        <el-select v-model="register.regist_method" placeholder="请选择">
          <el-option label="微信" value="微信"></el-option>
          <el-option label="支付宝" value="支付宝"></el-option>
          <el-option label="现金" value="现金"></el-option>
          <el-option label="银行卡" value="银行卡"></el-option>
          <el-option label="医保卡" value="医保卡"></el-option>
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item label="应收金额">
  <el-input 
    v-model="register.regist_money" 
    placeholder="自动计算" 
    disabled
  >
    <template slot="append">元</template>
  </el-input>
</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  data() {
    return {
      register: {
        case_number: '',
        real_name: '',
        gender: '男',
        card_number: '',
        birthday: '',
        age: '',
        home_address: '',
        visit_date: '',
        noon: 'AM', // 保留但不使用
        department_id: '',
        scheduling_time: '', // 格式如："周六下午"
        employee_id: '',
        regist_level_id: '',
        settle_category_id: '',
        is_book: '否',
        regist_method: '微信'
      },
      schedulingOptions: [
        '周一上午', '周一下午',
        '周二上午', '周二下午',
        '周三上午', '周三下午',
        '周四上午', '周四下午',
        '周五上午', '周五下午',
        '周六上午', '周六下午',
        '周日上午', '周日下午'
      ].map(time => ({
        label: time,
        value: time
      })),
      register_level: [],
      register_employee: [],
      register_settle: [],
      register_dept: [],
      allDepartments: [
        {id: '102', name: '心血管内科'},
        {id: '103', name: '神经内科'},
        {id: '104', name: '普通内科'},
        {id: '105', name: '消化内科'},
        {id: '106', name: '呼吸内科'},
        {id: '107', name: '内分泌科'},
        {id: '108', name: '肾病内科'},
        {id: '109', name: '血液内科'},
        {id: '110', name: '感染内科'},
        {id: '111', name: '老年病内科'},
        {id: '112', name: '风湿免疫内科'},
        {id: '113', name: '透析科'},
        {id: '114', name: '变态反应科'},
        {id: '201', name: '普通外科'},
        {id: '202', name: '泌尿外科'},
        {id: '203', name: '神经外科'},
        {id: '204', name: '胸外科'},
        {id: '205', name: '整形外科'},
        {id: '206', name: '肛肠外科'},
        {id: '207', name: '肝胆外科'},
        {id: '208', name: '乳腺外科'},
        {id: '209', name: '心血管外科'},
        {id: '210', name: '心脏外科'},
        {id: '211', name: '器官移植'},
        {id: '212', name: '微创外科'},
        {id: '213', name: '功能神经外科'},
        {id: '214', name: '腺体外科'},
        {id: '301', name: '儿科综合'},
        {id: '302', name: '小儿外科'},
        {id: '303', name: '儿童保健科'},
        {id: '304', name: '新生儿科'},
        {id: '305', name: '小儿骨科'},
        {id: '306', name: '小儿神经内科'},
        {id: '307', name: '小儿呼吸科'},
        {id: '308', name: '小儿血液科'},
        {id: '309', name: '小儿耳鼻喉科'},
        {id: '310', name: '小儿心内科'},
        {id: '311', name: '小儿康复科'},
        {id: '312', name: '小儿精神科'},
        {id: '313', name: '小儿肾内科'},
        {id: '314', name: '小儿消化科'},
        {id: '315', name: '小儿皮肤科'},
        {id: '316', name: '小儿急诊科'},
        {id: '317', name: '小儿内分泌科'},
        {id: '318', name: '小儿泌尿外科'},
        {id: '319', name: '小儿感染科'},
        {id: '320', name: '小儿心外科'},
        {id: '321', name: '小儿胸外科'},
        {id: '322', name: '小儿神经外科'},
        {id: '323', name: '小儿整形科'},
        {id: '324', name: '小儿风湿免疫科'},
        {id: '325', name: '小儿妇科'},
        {id: '401', name: '传染科'},
        {id: '402', name: '肝病科'},
        {id: '403', name: '艾滋病科'},
        {id: '404', name: '传染危重室'},
        {id: '501', name: '妇产科综合'},
        {id: '502', name: '妇科'},
        {id: '503', name: '产科'},
        {id: '504', name: '计划生育科'},
        {id: '505', name: '妇科内分泌'},
        {id: '506', name: '遗传咨询科'},
        {id: '507', name: '产前检查科'},
        {id: '508', name: '妇泌尿科'},
        {id: '601', name: '前列腺'},
        {id: '602', name: '性功能障碍'},
        {id: '603', name: '生殖器感染'},
        {id: '604', name: '男性不育'},
        {id: '605', name: '生殖整形'},
        {id: '701', name: '精神科'},
        {id: '702', name: '司法鉴定科'},
        {id: '703', name: '药物依赖科'},
        {id: '704', name: '中医精神科'},
        {id: '705', name: '双相障碍科'},
        {id: '801', name: '皮肤科'},
        {id: '802', name: '性病科'},
        {id: '901', name: '中医综合科'},
        {id: '902', name: '针灸科'},
        {id: '903', name: '中医骨科'},
        {id: '904', name: '中医妇产科'},
        {id: '905', name: '中医外科'},
        {id: '906', name: '中医儿科'},
        {id: '907', name: '中医肛肠科'},
        {id: '908', name: '中医皮肤科'},
        {id: '909', name: '中医五官科'},
        {id: '910', name: '中医按摩科'},
        {id: '911', name: '中医消化科'},
        {id: '912', name: '中医肿瘤科'},
        {id: '913', name: '中医心内科'},
        {id: '914', name: '中医神经内科'},
        {id: '915', name: '中医肾病内科'},
        {id: '916', name: '中医内分泌'},
        {id: '917', name: '中医呼吸科'},
        {id: '918', name: '中医肝病科'},
        {id: '919', name: '中医男科'},
        {id: '920', name: '中医风湿免疫内科'},
        {id: '921', name: '中医血液科'},
        {id: '922', name: '中医乳腺外科'},
        {id: '923', name: '中医老年病科'},
        {id: '1001', name: '肿瘤综合科'},
        {id: '1002', name: '肿瘤内科'},
        {id: '1003', name: '放疗科'},
        {id: '1004', name: '肿瘤外科'},
        {id: '1005', name: '肿瘤妇科'},
        {id: '1006', name: '骨肿瘤科'},
        {id: '1007', name: '肿瘤康复科'},
        {id: '1101', name: '骨外科'},
        {id: '1102', name: '手外科'},
        {id: '1103', name: '创伤骨科'},
        {id: '1104', name: '脊柱外科'},
        {id: '1105', name: '骨关节科'},
        {id: '1106', name: '骨质疏松科'},
        {id: '1107', name: '矫形骨科'},
        {id: '1201', name: '耳鼻咽喉头颈科'},
        {id: '1202', name: '口腔科'},
        {id: '1203', name: '眼科'},
        {id: '1301', name: '康复科'},
        {id: '1302', name: '理疗科'},
        {id: '1401', name: '麻醉科'},
        {id: '1402', name: '疼痛科'},
        {id: '1501', name: '营养科'},
        {id: '1502', name: '高压氧科'},
        {id: '1601', name: '功能检查科'},
        {id: '1602', name: '病理科'},
        {id: '1603', name: '检验科'},
        {id: '1604', name: '实验中心'},
        {id: '1605', name: '心电图科'},
        {id: '1606', name: '放射科'},
        {id: '1607', name: '超声诊断科'},
        {id: '1608', name: '医学影像科'},
        {id: '1609', name: '核医学科'},
        {id: '1701', name: '药剂科'},
        {id: '1702', name: '护理科'},
        {id: '1801', name: '体检科'},
        {id: '1802', name: '急诊科'},
        {id: '1901', name: '公共卫生与预防科'},
        {id: '2001', name: '设备科'},
        {id: '2002', name: '财务科'},
        {id: '2003', name: '药品管理科'}
      ],
      filteredDepartments: [],
      loading: false
    }
  },
  methods: {
      watch: {
      'register.birthday'(newVal) {
        if (newVal) {
          this.calculateAgeAndType();
        }
      },
      'register.regist_level_id'(newVal) {
        if (newVal) {
          this.setRegistFee();
        }
      }
    },
    // 计算年龄类型和实际年龄
    calculateAgeAndType() {
      if (!this.register.birthday) return;
      
      const birthDate = new Date(this.register.birthday);
      const today = new Date();
      const diffTime = Math.abs(today - birthDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 365) {
        this.register.age = diffDays.toString();
        this.register.age_type = '日';
      } else {
        const age = Math.floor(diffDays / 365);
        this.register.age = age.toString();
        this.register.age_type = '年';
      }
    },
    
    // 根据号别设置挂号费用
    setRegistFee() {
      if (!this.register.regist_level_id) return;
      
      const level = this.register_level.find(item => item.id === this.register.regist_level_id);
      if (!level) return;
      
      // 根据号别名称判断费用
      if (level.regist_name.includes('专家')) {
        this.register.regist_money = '50';
      } else if (level.regist_name.includes('主任')) {
        this.register.regist_money = '20';
      } else {
        this.register.regist_money = '8'; // 普通号
      }
    },
    async loadDoctors() {
      if (!this.register.department_id || !this.register.scheduling_time) {
        return;
      }
      
      try {
        const dept = this.allDepartments.find(d => d.id === this.register.department_id);
        if (!dept) return;
        
        const requestData = {
          deptName: dept.name,
          schedulingId: [this.register.scheduling_time]
        };
        
        const response = await this.$http.post("http://localhost:8091/api/searchDoctorInformation", requestData);
        
        // 处理返回的医生数据
        this.register_employee = response.data.map(doctor => ({
          id: doctor.id,
          realname: doctor.realname,
          registLevelId: doctor.registLevelId // 职称级别
        }));
        
        if (this.register_employee.length === 0) {
          this.$message.warning('该时段没有医生排班');
        }
      } catch (error) {
        console.error('加载医生列表失败:', error);
        this.$message.error('加载医生列表失败');
      }
    },
    
    handleDepartmentChange(value) {
      this.register.employee_id = '';
      this.register_employee = [];
      if (value && this.register.scheduling_time) {
        this.loadDoctors();
      }
    },
    
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.filteredDepartments = this.allDepartments.filter(item => {
            return item.name.toLowerCase().includes(query.toLowerCase());
          });
        }, 200);
      } else {
        this.filteredDepartments = this.allDepartments.slice(0, 50);
      }
    },
    
    addNewRegist() {
      // 确保计算了年龄类型和挂号费用
      if (this.register.birthday && !this.register.age_type) {
        this.calculateAgeAndType();
      }
      if (this.register.regist_level_id && !this.register.regist_money) {
        this.setRegistFee();
      }

      // 获取科室名称和医生姓名
      const deptObj = this.allDepartments.find(d => d.id === this.register.department_id);
      const doctorObj = this.register_employee.find(d => d.id === this.register.employee_id);

      // 构造后端需要的数据
      const registrationData = {
        case_number: this.register.case_number,
        real_name: this.register.real_name,
        gender: this.register.gender,
        card_number: this.register.card_number,
        birthday: this.register.birthday,
        age: this.register.age,
        age_type: this.register.age_type || '年',
        home_address: this.register.home_address,
        visit_date: this.register.visit_date,
        noon: this.register.noon,
        department_name: deptObj ? deptObj.name : '',
        doctor_name: doctorObj ? doctorObj.realname : '',
        regist_level_id: this.register.regist_level_id,
        settle_category_id: this.register.settle_category_id,
        is_book: this.register.is_book,
        regist_method: this.register.regist_method,
        regist_money: this.register.regist_money || '8'
      };

      this.$http.post("http://localhost:8091/addRegister", registrationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        this.$message.success(response.data.message || '挂号成功');
        this.clearRegist();
      })
      .catch(error => {
        this.$message.error('挂号失败: ' + (error.response?.data?.message || error.message));
      });
    },
    
    clearRegist() {
      this.register = {
        case_number: '',
        real_name: '',
        gender: '男',
        card_number: '',
        birthday: '',
        age: '',
        age_type: '年', // 默认年龄类型
        home_address: '',
        visit_date: '',
        department_id: '',
        scheduling_time: '',
        employee_id: '',
        regist_level_id: '',
        regist_money: '', // 会在选择号别时自动设置
        settle_category_id: '1',
        is_book: '否',
        regist_method: '微信'
      };
      this.register_employee = [];
      this.initDateTime();
    },
    
    getRegistLevelList() {
      this.$http.get("http://localhost:8091/getRegistLevelList").then(
        (resp) => {
          this.register_level = resp.data;
        }
      )
    },
    
    getDeptList() {
      this.$http.get("http://localhost:8091/getAllDeptList").then(
        (resp) => {
          this.register_dept = resp.data;
        }
      )
    },
    
    getSettleCategory() {
      this.$http.get("http://localhost:8091/getSettleCategory").then(
        (resp) => {
          this.register_settle = resp.data;
        }
      )
    },
    
    initDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      this.register.visit_date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      this.register.noon = now.getHours() < 12 ? 'AM' : 'PM';
    },
    
    getMaxCaseNumber() {
      this.$http.get("http://localhost:8091/getMaxCaseNumber").then(
        (resp) => {
          this.register.case_number = "M" + (parseInt(resp.data.replace("M", "")) + 1);
        }
      )
    }
  },
  mounted() {
    this.initDateTime();
    this.getRegistLevelList();
    this.getDeptList();
    this.getSettleCategory();
    this.getMaxCaseNumber();
    this.filteredDepartments = this.allDepartments.slice(0, 50);
  }
}
</script>

<style scoped>
.el-select {
  width: 100%;
}
.el-descriptions-item__content {
  display: flex;
  align-items: center;
}
.el-descriptions-item__content {
  position: relative;
}

.age-input-container {
  display: flex;
  align-items: center;
}

.age-input {
  width: 80px;
  margin-right: 10px;
}

.age-type-select {
  width: 100px;
}
</style>