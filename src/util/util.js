export const isNullMessage = (_this,val,msg)=>{
    if(typeof val == "undefined" || val == null || val == ""){
        _this.$message({
            message: msg,
            type: 'error'
        });
        return true;
    }else{
        return false;
    }
}
//从sessionStorage中得到登录用户信息
export const getSessionLoginUser = ()=>{
    let loginUser = sessionStorage.getItem("loginUser");
    if(loginUser != null && loginUser.length>0){
        try{
            return JSON.parse(loginUser);
        }catch{
            this.$message({
                message:"读取登录用户信息失败",
                type:"error"
            })
            return {id:1,realname:"扁鹊"};
        }
    }else{
        this.$message({
            message:"读取登录用户信息失败",
            type:"error"
        })
        return {id:1,realname:"扁鹊"};
    }
}