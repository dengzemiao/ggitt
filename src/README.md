## 简介

`ggitt` 是一个基于 Node 的 Git 命令增强工具，一键完成提交、合并、回滚、分支管理，完整兼容所有原生 git 命令。。

核心特性：

- **子命令增强**：`pull`、`push`、`merge`、`fix`、`config` 提供自动化 Git 流程
- **Git 透传**：不支持的命令自动转发给 git 执行，`ggit` 完全兼容所有 `git` 命令

使用命令：`ggit` 或 `gitt` 均可（方便在 `git` 前后多敲一个字母也能用）。

## 安装

请确保已安装 `Git` 和 `Node` 环境。

```sh
npm i -g ggitt
```

验证安装：

```sh
# 也支持 gitt -v
# 同时支持 ggit 或 gitt 作为指令
ggit -v
```

> 如果安装失败，或安装不到最新版本，尝试切换到官方 npm 镜像：`npm config set registry https://registry.npmjs.org` 并配置命令行代理，即可正常完成最新版本安装。

## 指令总览

### 选项（Options）

| ggit 命令 | 等价 git 命令 | 说明 |
| --- | --- | --- |
| `ggit -v` | - | 查看 ggit 版本号 |
| `ggit -g <branch>` | `git checkout <branch>` | 切换到指定分支（本地没有会拉取远程） |
| `ggit -c <branch>` | `git checkout <branch>` | 同 `-g`，为了 checkout 习惯 |
| `ggit -b <branch>` | `git checkout -b <branch>` | 以当前分支为基础新建分支 |
| `ggit -b` | - | 显示当前分支名 |
| `ggit -bl` | `git branch` | 列出本地分支 |
| `ggit -br` | `git branch -r` | 列出远程分支 |
| `ggit -ba` | `git branch -a` | 列出所有分支 |
| `ggit -d <branch>` | `git branch -D <branch>` | 删除本地分支 |
| `ggit -dr <branch>` | `git push origin -d <branch>` | 删除远程分支 |

### 子命令（Commands）

| ggit 命令 | 说明 |
| --- | --- |
| `ggit pull` | 自动建立远程分支跟踪并拉取最新数据 |
| `ggit push` | 一键完成 add → commit → pull → push |
| `ggit merge` | push 后自动合并到目标分支，再切回当前分支 |
| `ggit log` | 美化显示全部提交记录（graph + oneline + decorate） |
| `ggit log -n <count>` | 显示最近 n 条提交记录 |
| `ggit merged [branch]` | 查看已被指定分支合并的分支列表，不传则使用当前分支 |
| `ggit nomerged [branch]` | 查看尚未被指定分支合并的分支列表，不传则使用当前分支 |
| `ggit fix` | 修复分支偏移问题 |
| `ggit config` | 查看/修改默认配置 |

### Git 透传

ggit 不识别的命令会自动转发给 git 执行，所有 git 命令都能用：

```sh
ggit status              →  git status
ggit log --oneline       →  git log --oneline
ggit commit -m "提交"    →  git commit -m "提交"
ggit stash               →  git stash
ggit diff                →  git diff
ggit remote -v           →  git remote -v
```

## 使用示例

### push — 提交代码

```sh
# 原生 git（4 条命令）
git add .
git commit -m "优化代码"
git pull origin 当前分支
git push origin 当前分支

# ggit（1 条命令，自动完成以上全部流程）
ggit push -m "优化代码"

# 使用默认备注（当前时间 + 提交优化）
ggit push

# 提交后切换到指定分支
ggit push -m "优化代码" -g main
```

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `-m, --message [msg]` | 提交日志信息 | `当前时间 提交优化` |
| `-g, --go [branch]` | 提交后切换到指定分支 | - |
| `-s, --stash [type]` | 使用 stash 暂存区方式合并 | `true` |

### merge — 提交并合并

```sh
# 原生 git（8+ 条命令）
git add .
git commit -m "优化代码"
git pull origin 开发分支
git push origin 开发分支
git checkout dev
git pull origin dev
git merge 开发分支
git push origin dev
git checkout 开发分支

# ggit（1 条命令，自动完成以上全部流程）
ggit merge -m "优化代码"

# 合并到指定分支（默认 dev）
ggit merge -t main

# 合并后切换到指定分支
ggit merge -m "优化代码" -g 1.0

# 使用默认备注
ggit merge
```

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `-t, --to [branch]` | 合并目标分支 | `dev` |
| `-g, --go [branch]` | 完成后切换到的分支 | 当前分支 |
| `-m, --message [msg]` | 提交日志信息 | `当前时间 提交优化` |
| `-s, --stash [type]` | 使用 stash 暂存区方式合并 | `true` |

> 执行过程中遇到冲突，解决后重新执行一遍 `ggit merge` 即可完成提交。

### pull — 拉取代码

```sh
# 原生 git
git pull origin 当前分支

# ggit（自动建立远程分支跟踪）
ggit pull
```

### fix — 修复分支偏移

```sh
# 修复分支偏移（修复后自动提交）
ggit fix

# 修复后不提交
ggit fix -p false

# 修复后切换分支
ggit fix -g main
```

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `-p, --push [type]` | 修复后提交到远程 | `true` |
| `-g, --go [branch]` | 修复后切换到的分支 | - |
| `-m, --message [msg]` | 提交日志信息 | `当前时间 修复分支偏移` |

### log — 查看提交记录

```sh
# 显示全部提交记录（美化格式）
ggit log

# 显示最近 20 条
ggit log -n 20
```

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `-n, --number [count]` | 显示最近 n 条记录 | 全部 |

### merged / nomerged — 查看合并状态

```sh
# 查看已被当前分支合并的分支
ggit merged

# 查看已被指定分支合并的分支
ggit merged master

# 查看尚未被当前分支合并的分支
ggit nomerged

# 查看尚未被指定分支合并的分支
ggit nomerged master
```

### config — 配置管理

```sh
# 查看所有配置
ggit config

# 查看指定配置
ggit config get -t

# 修改默认合并分支为 master
ggit config set -t master

# 修改 stash 配置
ggit config set -s false
```

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `set` | 修改默认配置 | - |
| `get` | 查看默认配置 | - |
| `-t, --to [branch]` | 默认合并分支 | `dev` |
| `-s, --stash [type]` | 默认 stash 状态 | `true` |
