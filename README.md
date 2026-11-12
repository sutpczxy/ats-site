# ATS 自主式架构设计网站

本仓库为公开阅读版，包含架构总览、五个集成视图、SP01—SP10场景、工程演示和运行所需的静态资源。

首页：`index.html`。GitHub Pages地址： https://sutpczxy.github.io/ats-site/ （需在仓库设置启用Pages）。

本仓库不包含内部版本历史、场景编制源码、维护脚本、编制工具包、服务器配置或运行凭据。页面中的设计属于参考稿，业务授权、现场参数和实际接口仍需核定；工程演示不代表现场部署结果。

## GitHub Pages

进入 Settings → Pages，将 Source 设为 Deploy from a branch，选择 main 和 /(root)，然后保存。本网站为静态文件，无需服务器端运行环境。后续推送main后自动重新发布。

## 更新

由内部维护版本生成公开发布文件，再同步到本仓库。不要将完整内部工程目录或内部Git历史合并到本仓库。当前发布范围及文件校验值见public-release.json。
