# vue3-rabbitSupermarket

- 一个使用 Vue3+Vite+ElementPlus 开发的商城项目，项目来源：B 站

## 项目运行

### 先将代码克隆至本地仓库

```sh
npm clone https://github.com/Yionse/RabbitFreshLifeSupermarket.git
```

### 安装所需依赖包

- 这里需要注意一点，可能安装项目时，由于本地 Node 版本不一样，可能会导致警告等。另外也会由于各种插件，包跟本地版本不一样，导致各种各样的警告，自己自行百度即可

```sh
npm i
```

### 运行

```sh
npm run dev
```

## 目录结构

-- .vscode 不需要管

-- public 公共文件

-- src 项目源文件

​ ---- apis 所有封装好的请求文件夹

​ ---- assets 公共资源

​ ---- components 所使用到的公共组件

​ ---- composables 自定义封装的功能插件

​ ---- directives 自己封装的自定义指令

​ ---- router 路由信息

​ ---- stores Pinia 管理

​ ---- styles 公共样式

​ ---- utils 工具，其中主要包含了 http 请求所需的 httpInstances

​ ---- views 路由组件

-- .gitignore git 忽略文件

-- README.md 说明文档

-- index.html 项目根页面

-- jsconfig.json 配置统一的根目录，这里用的@ 符

-- package-lock.json 项目包的说明

-- package.json 项目依赖及包版本

-- vite.config.json vite 的配置文件

## 所使用到的技术栈

![Image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/one.png?raw=true?token=GHSAT0AAAAAACFIR44BDBR3TAKZHCAQJZSSZKK4GQQ)

## 路由详解

![Image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/two.png)

## 接口详解

![Image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/three.png)

# 组件详解

## LayoutNav

- ![Image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/four.png)
- 有两种状态，登录与未登录
- ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717175058248.png)
- ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717175213328.png)

## LayoutHeader

- ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717175245698.png)
- 这里还有另外一个组件，是当夜间 滑动时固定在上面部分的，类似于该组件，且 接口也是同一个，区别是这里有一个购物车按钮
- ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717175343450.png)
- ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717175434415.png)

## LayoutFooter

- 底部组件，没有什么交互
- ![imag](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717175522024.png)

## HeaderCart

- nav 中的小购物车图标
- ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717175630248.png)
- ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717175842492.png)

## Login

- 登录页
- 账号密码
  - 账号 heima282，好像可以一直到 heima290
  - 密码都是 hm#qd@23!
- ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717175951114.png)
- 配置自定义的校验规则
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717180027987.png)
- 进行登录验证
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717180103766.png)

## Detail

- 详情页
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717182648646.png)
- 面包屑导航
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717182728962.png)
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717182735011.png)
- SKU 组件
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717182753049.png)
- 热榜
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717182808104.png)
- 加入购物车调用接口
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717182828986.png)

## CartList

- 购物车页面
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717182935042.png)
- 采用封装好的 Store 进行状态管理
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717182948179.png)
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717183050345.png)

## Checkout

- 提交订单界面
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717183116173.png)
- 可以进行地址切换
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717183129599.png)

## Pay

- 支付页
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717183208473.png)
  - 只有支付宝可以使用
- 使用的是虚拟支付，但现在已经无法支付了，所以只能到这一步

# Store 详解

- cart.js
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717183358009.png)
  - 与购物车相关的，添加，删除，全选，单选等
- category.js
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717183455024.png)
  - nav 相关的，这里是为了不重复发两次请求，所以使用了 Pinia
- user.js
  - ![image](https://github.com/Yionse/ProjectDescriptionPicture/blob/main/RabbitFreshLifeSupermarket/image-20230717183547078.png)
  - 用户相关的，存储了用户的信息，最下面的 persist 做了持久化存储，与笨比的 LocalStorage 同步
