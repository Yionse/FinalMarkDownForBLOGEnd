# FinalMarkDownForBLOGEnd

基于 react+Nodejs 的博客设计，后端

# 引入 SSl 证书

非必要，如果有这个需求的话，可以将私钥的.crt 和.key 引入到根目录，注意是根目录，不是 src，然后对应更改文件名即可，然后端口改成 443，在本地就可以通过 h ttps://localhost:端口号访问后端服务了

# 缺失文件

需在根文件下，新建.env 环境变量，定义自己的数据库连接以及 token 等

```python
# 数据库连接
HOST = "*****"
# 数据库账户名
USER = "*****"
# 数据库密码
PASSWORD = "*****"
# 数据库名
DATABASE = "*****"
# QQ邮箱授权码
AUTHORZATION_CODE = "*****"
# 发送验证码的源邮箱
QQ = "*****"
# token秘钥
SECRETKEY = "*****"
# token有效时间
TOKEN_VALIDITY = '1 day'
# #限制访问IP
# IP_LIMIT = 127.0.0.1
```

- 其中邮箱授权码在 QQ 邮箱 PC 端可以获取到，粘贴即可，邮箱授权码是用于在注册时向用户发验证码邮件的根邮箱

# 其他

- 友链：https://zhangtc.online
- 该网站为此项目上线网址
- 如需要 MySQL 结构的请联系我
