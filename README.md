# 无境剑-弱口令字典生成器

Chrome 浏览器插件，基于域名和自定义关键字自动生成企业弱口令字典，用于授权的渗透测试和安全评估。

## 安装

1. 下载或克隆本项目
2. 打开 Chrome，地址栏输入 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `weak-password-dict` 文件夹
6. 点击工具栏插件图标即可使用

## 功能

### 域名自动提取

- `baidu.com` → `baidu`
- `lydx.edu.cn` → `lydx`
- `zj.gov.cn` → `zj`
- `www.baidu.com.cn` → `baidu`
- IP 地址自动跳过
- 支持 `.com.cn` `.edu.cn` `.gov.cn` `.co.uk` `.co.jp` 等特殊二级域名

### 自定义关键字

- 中文自动转拼音：`临沂大学` → `linyidaxue`
- 英文保持不变：`admin` → `admin`
- 支持逗号分隔多个关键字
- 自动去重

### 9 种密码生成规则

| 规则 | 示例 |
|------|------|
| `{data}@年份` 小写 | `admin@2025` |
| `{Data}@年份` 首字母大写 | `Admin@2025` |
| `{data}@常见后缀` | `admin@123456` |
| `{data}#YYYY` 多分隔符 | `admin#2025` `admin_2025` `admin-2025` `admin.2025` |
| `{data}YYYY` 无分隔符 | `admin2025` `admin123456` |
| 全大写 `{DATA}` | `ADMIN@2025` |
| `admin@{data}` 账号前缀 | `root@lydx` `sa@lydx` |
| `YYYY@{data}` 反转顺序 | `2025@admin` `123456@admin` |
| `{data}@123.com` 企业后缀 | `admin@qq.com` `admin@163.com` |

每种规则支持小写、首字母大写、全大写三种变体（全大写为全局开关）。

### 其他

- 年份范围可自定义（默认 2010-2026）
- 4 组可编辑后缀列表，支持恢复默认
- 一键复制全部结果
- 下载为 TXT 文件
- 结果自动去重排序

## 使用截图

![popup](screenshots/popup.png)

## 免责声明

本工具仅用于**授权的**渗透测试、安全评估、CTF 挑战和防御性安全研究。使用者须自行确保获得合法授权，作者不对任何未授权使用承担责任。

## License

MIT
