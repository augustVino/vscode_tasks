# vscode 通过 tasks 实现批量编译

> 通常情况，每个前端同事都会同时维护很多的项目。有种情形是某端发版，会同时发布多个项目。如果单独依次发布，那效率相当的低。这里通过 vscode 模拟多个 npm 包的升级发版，把重复的工作交给机器。

## 实现步骤

「vscode」--> 「终端」--> 「配置任务」会在当前目录中自动生成 .vscode/tasks.json 文件。

## 完善配置

根据自己项目情况，配置 tasks.json 文件和相关的脚本文件即可。
