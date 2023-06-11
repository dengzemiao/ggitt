## 一、简介

- 在开发过程中，习惯用 `Git 命令` 提交、合并代码的小伙伴会发现，经常在重复的敲提交代码就算了，尤其是测试环节，修好之后，来回切换提交、合并操作，所以这也是很多小伙伴选择用可视化操作的原因。

- 博主就是一个喜欢用 `Git 命令` 的人，不太喜欢可视化的软件。所以使用 `Node` 对 `Git` 相关命令进行包装，做了一个自动化命令工具`【cggit】`。

- 在自动化命令的基础上，还额外支持所有不带参的 `git` 原生命令，下面使用中有说明什么叫不带参命令。

- 在执行 `cggit` 自动化命令过程中遇到冲突，解决后，可继续执行一遍相关命令 `push， merge` 完成提交。

  ![cmd.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec0cc33d78d24fe9ae96483d627b11fc~tplv-k3u1fbpfcp-watermark.image?)

## 二、安装

- 请务必安装好 `Git` 、 `Node` 环境。

  `Windows` 包管理工具：[winget](https://blog.csdn.net/zz00008888/article/details/131091717)

  `Mac` 包管理工具：[homebrew](https://blog.csdn.net/zz00008888/article/details/113867051)

  `Linux` 包管理工具：`Yum`

  各平台都可以通过包管理工具快速安装 `Git` 、`Node`。

- 将 `cggit` 安装到全局，使用命令 `$ ggit xxx`

  ```sh
  $ npm i -g cggit
  ```

  ```sh
  $ ggit -v
  ```

  如果安装失败，可将镜像切换到官方镜像尝试

  ```sh
  # 查看镜像
  $ npm get registry

  # 切换为官方镜像
  $ npm config set registry https://registry.npmjs.org

  # 切换为淘宝镜像
  $ npm config set registry https://registry.npm.taobao.org
  ```

- 可通过 `ggit -h` 查看帮助文档，查看支持子命令与参数

  ```sh
  $ ggit -h
  ```

  ```sh
  # 输出
  Usage: ggit [options] [command]

  # ggit 支持的参数
  Options:
    -v               output the version number
    -V, --version    output the version number
    -h, --help       display help for command

  # ggit 支持的子命令
  Commands:
    push [options]   提交当前分支到远程仓库，并可在提交完成后，自动切换到指定分支
    merge [options]  提交当前分支到远程仓库，并合并到指定分支，再返回当前分支/指定分支
    fix [options]    目前主要作用于修复分支偏移问题
    help [command]   display help for command
  ```

- 可通过 `ggit push|merge|fix -h` 查看帮助文档，查看子命令支持参数

  ```sh
  $ ggit push -h
  ```

  ```sh
  Usage: ggit push [options]

  提交当前分支到远程仓库

  # push 支持的参数
  Options:
    -g, --go [branch]    合并提交结束后，切换到指定分支
    -s, --stash [type]   使用 stash 暂存区方式合并代码，如果手动终止了脚本，需要使用 $ git pop 放出暂存区的代码，以免丢失 (default: true)
    -m, --message [msg]  提交日志信息 (default: "2023-06-09 11:32:11 提交优化")
    -h, --help           display help for command
  ```

## 三、使用

- `ggit` 目前支持的子命令列表大纲

  ```sh
  # 1、提交代码
  $ ggit push

  # 2、合并代码
  $ ggit merge

  # 3、修复分支偏移，一般情况不需要，看到报错分支偏移时可以使用
  $ ggit fix

  # 4、修改默认配置
  # 比如 merge 默认合并的是 dev 分支，如果想默认是的 master，则可以通过 cset 修改，这样就不需要在 $ ggit merge 时不需要指定 -t master，其他配置同理。
  $ ggit config set -t master

  # 5、获取所有默认配置
  $ ggit config === $ ggit config get
  # 获取指定配置
  $ ggit config -t === $ ggit config get -t
  ```

- 子命令参数介绍

  | `push`               | 含义                                                                                              | 支持传参                  | 默认值              |
  | -------------------- | ------------------------------------------------------------------------------------------------- | ------------------------- | ------------------- |
  | -g, --go \[branch]   | 合并提交结束后，切换到指定分支                                                                    | 分支名称                  | -                   |
  | -s, --stash \[type]  | 使用 stash 暂存区方式合并代码，如果手动终止了脚本，需要使用 \$ git pop 放出暂存区的代码，以免丢失 | 0/1/true/false/Ture/False | true                |
  | -m, --message \[msg] | 提交日志信息                                                                                      | -                         | 当前时间 + 提交优化 |

  | `merge`              | 含义                                                                                              | 支持传参                  | 默认值              |
  | -------------------- | ------------------------------------------------------------------------------------------------- | ------------------------- | ------------------- |
  | -t, --to \[branch]   | 合并到指定的分支                                                                                  | 分支名称                  | dev                 |
  | -g, --go \[branch]   | 合并提交结束后，切换到指定分支                                                                    | 分支名称                  | 当前分支            |
  | -s, --stash \[type]  | 使用 stash 暂存区方式合并代码，如果手动终止了脚本，需要使用 \$ git pop 放出暂存区的代码，以免丢失 | 0/1/true/false/Ture/False | true                |
  | -m, --message \[msg] | 提交日志信息                                                                                      | -                         | 当前时间 + 提交优化 |

  | `fix`                | 含义                             | 支持传参                  | 默认值                  |
  | -------------------- | -------------------------------- | ------------------------- | ----------------------- |
  | -p, --push \[type]   | 修复完成后，将代码提交到远程分支 | 0/1/true/false/Ture/False | true                    |
  | -g, --go \[branch]   | 合并提交结束后，切换到指定分支   | 分支名称                  | -                       |
  | -m, --message \[msg] | 提交日志信息                     | -                         | 当前时间 + 修复分支偏移 |

  | `config`            | 含义                          | 支持传参                               | 默认值 |
  | ------------------- | ----------------------------- | -------------------------------------- | ------ |
  | set                 | 修改默认配置                  | 必传（例：`$ ggit config set -t dev`） | -      |
  | get                 | 查看默认配置                  | 必传（例：`$ ggit config get -t`）     | dev    |
  | -t, --to \[branch]  | 合并到指定的分支              | 分支名称                               | dev    |
  | -s, --stash \[type] | 是否使用 stash 暂存区合并状态 | 0/1/true/false/Ture/False              | true   |

- 子命令参数使用

  例如：当前在 2.0 分支，需要直接提交当前分支，使用默认备注即可。

  ```sh
  $ ggit push
  ```

  例如：当前在 2.0 分支，需要带上提交备注，提交当前分支到远程。

  ```sh
  $ ggit push -m "优化代码"

  或

  $ ggit push --message '优化代码'
  ```

  例如：当前在 2.0 分支，需要带上提交备注，提交当前分支到远程，提交完成后切换到 1.0 分支。

  ```sh
  $ ggit push -m '优化代码' -g 1.0
  ```

- 扩展性，除了支持上面的子命令外，额外支持全部 `git` 命令，但是不支持带参数的命令：

  ```sh
  $ ggit add .               =       $ git add .
  $ ggit commit -m '备注'     =       $ git commit -m '备注'
  $ ggit pull                =       $ git pull
  ....
  # 基本所有不带参的 git 命令都支持

  # 只有执行 push、merge 命令时会被 ggit 拦截，并使用 ggit 的 push、merge
  $ ggit push origin master  =       执行的是 $ ggit push，而不是 $ git push，多余的参数会不生效，merge 同理，其他命令都不会被拦截，因为不同名。
  ```

  ```sh
  # 什么叫带参命令，例如：
  $ git branch --set-upstream-to=origin/<分支> 5.0

  # 如果确实要用，肯定不如直接使用 git，但是也能用，使用 '' 或 "" 包裹一下即可
  # $ ggit '包裹的命令'
  $ ggit 'branch --set-upstream-to=origin/<分支> 5.0'

  # -- 或 - 开头的就是参数，不支持 git 的这种带参命令，不带参数的都支持
  ```

## 四、与 `Git` 原生命令对比

- 提交代码

  ```sh
  # 原生
  $ git add .
  $ git commit -m '优化代码'
  $ git pull origin 当前分支
  $ git push origin 当前分支
  ```

  ```sh
  # ggit
  $ ggit push -m "优化代码"

  # 如果不需要备注，使用默认备注
  $ ggit push
  ```

- 修复 `BUG`，提交当前分支，合并到 `dev` 分支，并切回当前开发分支或其他分支

  ```sh
  # 原生
  $ git add .
  $ git commit -m '优化代码'
  $ git pull origin 开发分支
  $ git push origin 开发分支
  $ git checkout dev
  $ git pull origin dev
  $ git merge 开发分支

  # 在这环节，ggit 如果 merge 遇到冲突，解决后，继续执行一遍 merge 命令，也能完成提交代码，加上 -g 就能再次回到指定分支
  # 也可以使用 push 命令上传，原生命令就还的 add 敲一遍。

  $ git push origin dev
  $ git checkout 开发分支/指定分支
  ```

  ```sh
  # ggit

  # 提交合并完成回到当前分支（-g 默认当前分支）
  $ ggit merge -m "优化代码"

  # 提交合并完成回到指定分支
  $ ggit merge -m "优化代码" -g 1.0

  # 如果不需要备注，使用默认备注
  $ ggit merge
  ```
