<template>
    <!-- 项目主界面 -->
    <el-container style="height: 100vh; display: flex; flex-direction: column;">
        <!-- 主界面的标题栏 -->
        <el-header style="background-color: #20A0FF; height: 60px;">
            <div style="display:flex;justify-content:space-between">
                <div style="display:flex">
                    <div class="home-title-text" style="width:220px">树人慧医管理系统</div>
                    <div class="home-title-icon"><i class="el-icon-s-fold"></i></div>
                </div>
                <div style="display:flex">                    
                    <div class="home-title-img">
                        <el-image src="logo.png" fit="contain "></el-image>    
                    </div>
                    <div class="home-title-menu" style="width:150px">
                        <el-dropdown @command="dropdownClick">
                            <span class="el-dropdown-link">
                                {{titleUserName}}<i class="el-icon-arrow-down el-icon--right"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown" >
                                <el-dropdown-item divided command="logout">退出</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown> 
                    </div>
                </div>
            </div>
        </el-header>
        <el-container style="flex: 1; overflow: hidden;">
            <el-aside style="background-color: #D3DCE6;" width="240px">
                <el-menu default-active="1" class="el-menu-demo" style="background-color: #ECECEC" mode="vertical" router>
                    <el-submenu :index="'' + index" v-for="(item, index) in menuList" :key="index">
                    <template slot="title">
                        <i :class="item.iconCls"></i>
                        <span>{{ item.name }}</span>
                    </template>
                    <el-menu-item :index="child.path" v-for="(child, cindex) in item.children" :key="cindex">
                        <span>{{ child.name }}</span>
                    </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main style="overflow: auto;background-color: #E9EEF3;">
                <router-view/>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>

export default ({
    mounted: function(){
        // 过滤掉 hidden: true 的路由
        this.menuList = this.$router.options.routes.filter(route => !route.hidden);
        
        let loginUser = sessionStorage.getItem("loginUser");
        if(loginUser != null && loginUser.length > 0){
        loginUser = JSON.parse(loginUser);
        this.titleUserName = loginUser.realname;
        this.dept_type = loginUser.dept_type;
        }
        console.log(this.menuList); // 添加这行来检查 menuList 是否正确获取
    },
    methods:{
        dropdownClick(commond){
            if(commond == "logout"){
                sessionStorage.removeItem("loginUser");
                sessionStorage.removeItem("Flag");
                //退出跳转到指定页面
                location.href="http://localhost:8080/index.html";
            }           
        }
    },
    data(){
        return{
            menuList:[],
            titleUserName:"东软医生",
            dept_type:''//部门类型
        }
    }
})
</script>

<style scoped>
.home-title-text {
    color: #FFFFFF;
    font-size: 22px;
    margin-top: 15px;
    text-align: left;
}
.home-title-icon {
    margin-top: 15px;
    width: 40px;
    font-size: 22px;
}
.home-title-img{
    margin-top: 10px;
}
.home-title-menu{
    margin-top: 15px;
}
.el-dropdown-link {
    cursor: pointer;
    color: #FFFFFF;
    font-size: 20px;
}
.el-icon-arrow-down {
    font-size: 20px;
}
</style>