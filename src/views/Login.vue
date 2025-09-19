<template>
<div>
  <el-form class="login-container" label-position="left"
           label-width="0px" v-loading="loading">
    <h3 class="login_title">系统登录</h3>
    <el-form-item prop="account">
      <el-input type="text" v-model="loginForm.username" auto-complete="off" placeholder="账号"></el-input>
    </el-form-item>
    <el-form-item prop="checkPass">
      <el-input type="password" v-model="loginForm.password" auto-complete="off" placeholder="密码"
                @keyup.enter.native="submitClick"></el-input>
    </el-form-item>
    <el-checkbox class="login_remember" v-model="checked" label-position="left">记住密码</el-checkbox>
    <el-form-item style="width: 100%">
      <el-button type="primary" @click.native.prevent="submitClick" style="width: 100%">登录</el-button>
    </el-form-item>
  </el-form>
  <el-divider></el-divider>
  <el-descriptions title="登录说明（建议分辨率：1920*1080）" style="margin: 0 auto; width: 60%;"  :column="2" border>
    <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label">
        <i class="el-icon-user"></i>
        超级用户名
      </template>
      root （<span style="color:#901010">注意：可以查看所有功能，但是不要进行业务操作</span>）
    </el-descriptions-item>
    <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label" >
        <i class="el-icon-mobile-phone"></i>
        密码
      </template>
      123
    </el-descriptions-item>
    <!-- <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label">
        <i class="el-icon-user"></i>
        挂号用户名
      </template>
      挂号
    </el-descriptions-item>
    <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label" >
        <i class="el-icon-mobile-phone"></i>
        密码
      </template>
      123
    </el-descriptions-item>  
    <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label">
        <i class="el-icon-user"></i>
        医生用户名
      </template>      
      扁鹊（范无病、华佗、葛洪等） <span style="color:#901010">注意：需要根据登录医生查看患者</span>      
    </el-descriptions-item>
    <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label" >
        <i class="el-icon-mobile-phone"></i>
        密码
      </template>
      123
    </el-descriptions-item>
    <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label">
        <i class="el-icon-user"></i>
        检查用户名
      </template>
      检查
    </el-descriptions-item>
    <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label" >
        <i class="el-icon-mobile-phone"></i>
        密码
      </template>
      123
    </el-descriptions-item>
        <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label">
        <i class="el-icon-user"></i>
        检验用户名
      </template>
      检验
    </el-descriptions-item>
    <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label" >
        <i class="el-icon-mobile-phone"></i>
        密码
      </template>
      123
    </el-descriptions-item>
        <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label">
        <i class="el-icon-user"></i>
        处置用户名
      </template>
      处置
    </el-descriptions-item>
    <el-descriptions-item :labelStyle="{'width':'120px'}">
      <template slot="label" >
        <i class="el-icon-mobile-phone"></i>
        密码
      </template>
      123
    </el-descriptions-item> -->
  </el-descriptions>
</div>
</template>
<script>

  export default{
    mounted: function () {
      this.rememberPassword();
    },

    data(){
      return {
        checked: false,
        loginForm: {
          username: '',//扁鹊,
          password: '',//123
        },
        loading: false
      }
    },

    methods: {
      rememberPassword(){
        let  userInfo =  localStorage.getItem("remember_password");
        if(userInfo!=null && userInfo.length>0){
          userInfo = JSON.parse(userInfo);
          this.loginForm.username = userInfo.username;
          this.loginForm.password = userInfo.password;
        }else{
          this.loginForm.username = "";
          this.loginForm.password = "";
        }
      },

      submitClick: function () {

        if (this.loginForm.username == null || this.loginForm.username.length == 0
          ||  this.loginForm.password == null || this.loginForm.password.length == 0) {

          this.$message({
            type: 'info',
            message: '用户名和密码不能为空!'
          });
          return;
        }

        let url = "http://localhost:8091/login?username=" + this.loginForm.username + "&password=" + this.loginForm.password;
        //按用户名和密码查询
        this.$http.get(url).then(resp=> {
          let userInfo = resp.data;
          if (userInfo == null || userInfo.length == 0){
            this.$message({
              message:'用户名或密码 不存在或错误!',
              type:'error'
            });
          }
          else {
            //我们设置一个名为Flag，值为isLogin的字段，作用是如果Flag有值且为isLogin的时候，证明用户已经登录了。
            sessionStorage.setItem("Flag", "isLogin");
            sessionStorage.setItem("loginUser", JSON.stringify(userInfo[0]));
            this.$message('欢迎 '+ userInfo[0].realname + ' 登录成功!');
            if(this.checked == true){
              localStorage.setItem("remember_password", JSON.stringify(this.loginForm));
            }else{
              localStorage.removeItem("remember_password");
            }
            //登录成功后跳转到指定页面
            this.$router.replace({path: '/home/home'});
          }
        });
      },
    }
  }
</script>
<style scope>
.login-container {
  border-radius: 15px;
  background-clip: padding-box;
  margin: 100px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}

.login_title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #505458;
}

.login_remember {
  margin: 0px 0px 35px 0px;
  text-align: left;
}
</style>
