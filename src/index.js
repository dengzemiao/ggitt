#!/usr/bin/env node

// 处理命令
const shell = require('shelljs')
// 处理输出
const chalk = require('chalk')
// 处理文件
const fs = require('fs')
// 路径
const path = require('path')
// 配置
const config = require('./config.json')
// 命令行辅助
const { program } = require('commander')
// 当前版本
const { version } = require('./package.json')

// ================================================== 公共处理

// 执行命令，控制台【不输出结果只返回，检查命令是否执行结束】
function execSilentCheck(cmd, config) {
  // 返回结果
  return exec(cmd, { silent: true, check: true, ...config })
}
// 执行命令，控制台【不输出结果只返回，不检查命令是否执行结束】
function execSilent(cmd, config) {
  // 返回结果
  return exec(cmd, { silent: true, ...config })
}
// 执行命令，控制台【输出结果并返回，检查命令是否执行结束】
function execCheck(cmd, config) {
  // 返回结果
  return exec(cmd, { check: true, ...config })
}
// 执行命令，控制台【输出结果并返回，不检查命令是否执行结束】
function exec(cmd, config) {
  // 配置
  const conf = config || {}
  // 执行命令
  const res = shell.exec(cmd, {
    // 不输出结果
    silent: conf.silent
  })
  // 执行失败
  if (res.code != 0 && conf.check) {
    // 如果处于禁止输出状态，强行输出错误结果
    if (conf.silent) {
      // 输出错误结果
      console.log(rmEnter(res.stdout))
    }
    // 输出错误提示
    showError(cmd, conf.errMsg)
    // 结束脚本提示
    if (conf.exitMsg) {
      // 以错误结果展示
      BgError(conf.exitMsg)
    }
    // 停止脚本
    if (conf.exit === undefined || conf.exit === true) {
      exit(res.code)
    }
  }
  // 返回结果
  return res
}
// 结束脚本 code: 0 结束 1 失败
function exit(code) {
  process.exit(code)
}
// 显示错误
function showError(cmd, msg) {
  // 错误消息
  const errMsg = msg || `${cmd} 执行失败`
  // 输出错误提示
  BgError(`========================================== Error：${errMsg}`)
}
// 移除头尾空格与换行符
function rmEnter(text) {
  return (text || '').trim()
}
// 判断值是否为true
function isTure(value) {
  // 支持 1、'1'、'true'、'Ture'
  return value == 1 || value === true || value == 'true' || value == 'Ture'
}

// 输出
// const Info = (msg) => { console.log(chalk.blueBright.bold(msg)) }
// const Error = (msg) => { console.log(chalk.redBright.bold(msg)) }
// const Success = (msg) => { console.log(chalk.greenBright.bold(msg)) }
// const Warning = (msg) => { console.log(chalk.hex('#FFA500').bold(msg)) }

// 输出(带背景)
const BgInfo = (msg) => { console.log(chalk.bgBlue.bold(msg)) }
const BgError = (msg) => { console.log(chalk.bgRed.bold(msg)) }
const BgSuccess = (msg) => { console.log(chalk.bgGreenBright.bold(msg)) }
const BgWarning = (msg) => { console.log(chalk.bgHex('#FFA500').bold(msg)) }

// 当前分支
var cb = (execSilent('git branch').stdout.match(/(?<=\* ).*/g) || [])[0]
// 当前时间
var ctime = nowDate()
// 本地分支列表
var lbs = []
// 远程分支列表
var rbs = []
// 当前分支存在远程分支
var isrb = false
// 修复分支前缀
const fbPrefix = `ggit-fix-`
// 配置文件路径
const configPath = path.join(__dirname, 'config.json')

// 初始化
function initData() {
  // 检查是否安装了 git
  execSilentCheck('git --version', { errMsg: '请检查 Git 是否安装！' })
  // 检查是否支持 Git 仓库
  execSilentCheck('git branch', { errMsg: '请检查当前项目是否支持了 Git 仓库！' })
  // 同步 Git 最新数据
  execSilent('get fetch')
  // 本地分支列表
  lbs = execSilentCheck('git branch').stdout.match(/(?<=  ).*?(?=[ |\n])/g) || []
  // 把当前分支添加进去
  lbs.push(cb)
  // 远程分支列表
  rbs = execSilentCheck('git branch -r').stdout.match(/(?<=\/).*?(?=[ |\n])/g) || []
  // 当前分支存在远程分支
  isrb = rbs.includes(cb)
  // 移除修复分支
  delFixBranch(rbs)
}

// 获取当前时间
function nowDate() {
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  if (month >= 1 && month <= 9) { month = '0' + month }
  if (day >= 0 && day <= 9) { day = '0' + day }
  if (hour >= 0 && hour <= 9) { hour = '0' + hour }
  if (minute >= 0 && minute <= 9) { minute = '0' + minute }
  if (second >= 0 && second <= 9) { second = '0' + second }
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// ================================================== pull

program
  // 命令
  .command('pull')
  // 描述
  .description('同步当前分支的远程数据，如果未建立远程分支跟踪，会自动跟踪远程分支，并拉取最新数据')
  // 事件
  .action((option) => {
    // 返回分支
    const gb = option.go
    // 输出日志
    BgSuccess('========================================== 开始拉取 ==========================================')
    // 初始化
    initData()
    // 跟踪远程分支
    execSilent(`git branch --set-upstream-to=origin/${cb} ${cb}`)
    // 拉取分支
    pullBranch(cb)
    // 执行完成
    BgSuccess('========================================== 拉取结束 ==========================================')
  })

// ================================================== push

program
  // 命令
  .command('push')
  // 描述
  .description('提交当前分支到远程仓库，并可在提交完成后，自动切换到指定分支')
  // 配置
  .option('-g, --go [branch]', '合并提交结束后，切换到指定分支')
  .option('-s, --stash [type]', '使用 stash 暂存区方式合并代码，如手动终止脚本、执行失败停止脚本，需检查是否执行了 $ git stash pop 命令，没有执行需要手动执行放出暂存区的代码，以免丢失', config.stash)
  .option('-m, --message [msg]', '提交日志信息', `${ctime} 提交优化`)
  // 事件
  .action((option) => {
    // 返回分支
    const gb = option.go
    // 输出日志
    BgSuccess('========================================== 开始提交 ==========================================')
    // 初始化
    initData()
    // 提交当前分支
    pushCurrentBranch(option)
    // 指定分支有值
    if (gb) {
      // 切换到指定分支
      goBranch(gb)
    }
    // 执行完成
    BgSuccess('========================================== 提交结束 ==========================================')
  })

// ================================================== merge

program
  // 命令
  .command('merge')
  // 描述
  .description('提交当前分支到远程仓库，并合并到指定分支，再返回当前分支/指定分支')
  // 配置
  .option('-t, --to [branch]', '合并到指定的分支', config.to)
  .option('-g, --go [branch]', '合并提交结束后，切换到指定分支', cb)
  .option('-s, --stash [type]', '使用 stash 暂存区方式合并代码，如手动终止脚本、执行失败停止脚本，需检查是否执行了 $ git stash pop 命令，没有执行需要手动执行放出暂存区的代码，以免丢失', config.stash)
  .option('-m, --message [msg]', '提交日志信息', ` 提交优化`)
  // 事件
  .action((option) => {
    // 输出日志
    BgSuccess('========================================== 开始合并 ==========================================')
    // 初始化
    initData()
    // 提交当前分支
    pushCurrentBranch(option)
    // 合并到指定分支
    mergeToBranch(option)
    // 执行完成
    BgSuccess('========================================== 合并结束 ==========================================')
  })

// ================================================== fix

program
  // 命令
  .command('fix')
  // 描述
  .description('目前主要作用于修复分支偏移问题')
  // 配置
  .option('-p, --push [type]', '修复完成后，将代码提交到远程分支', true)
  .option('-g, --go [branch]', '合并提交结束后，切换到指定分支')
  .option('-m, --message [msg]', '提交日志信息', `${ctime} 修复分支偏移`)
  // 事件
  .action((option) => {
    // 输出日志
    BgSuccess('========================================== 开始修复 ==========================================')
    // 初始化
    initData()
    // 修复分支偏移
    fixBranch(option)
    // 执行完成
    BgSuccess('========================================== 修复结束 ==========================================')
  })

// ================================================== config

program
  // 命令
  .command('config')
  // 描述
  .description('修改/查看默认配置')
  // 配置
  .option('set', '修改默认配置')
  .option('get', '查看默认配置')
  .option('-t, --to [branch]', '合并到指定的分支')
  .option('-s, --stash [type]', '是否使用 stash 暂存区合并状态')
  // 事件
  .action((option, cmd) => {
    // 检查配置类型
    if (cmd.args.includes('set')) {
      // 获取所有字段
      const keys = Object.keys(option || {})
      // 字段列表有值
      if (keys.length) {
        // 组装输出
        keys.forEach((key) => {
          // 输出
          config[key] = option[key]
        })
      } else {
        // 提示
        console.log('缺少需要配置的参数')
        // 停止
        exit(1)
      }
      // 转成 json 字符串
      const json = JSON.stringify(config, null, '\t')
      // 写入配置
      fs.writeFile(configPath, json, 'utf8', (err) => {
        if (!err) {
          // 成功
          console.log(json)
          console.log('Set Success!')
        } else {
          // 失败
          console.log('修改失败')
        }
      })
    } else {
      // 获取所有字段
      const keys = Object.keys(option || {})
      // 字段列表有值
      if (keys.length) {
        // 组装输出
        keys.forEach((key) => {
          // 输出
          console.log(config[key])
        })
      } else {
        // 转成 json 字符串
        const json = JSON.stringify(config, null, '\t')
        // 输出所有配置
        console.log(json)
      }
    }
  })

// ================================================== 封装方法

// 提交当前分支
function pushCurrentBranch(option) {
  // 输出日志
  BgWarning(`==== 注意：如果当前工程使用了第三方提交插件(例：cz 等)，会拦截命令导致无法提交，请直接使用第三方插件提交！ `)
  // 本轮暂存区是否有代码
  var isStash = false
  // 需要提交代码（可能刚才解决冲突）
  var isNeedsMerge = false
  // 是否使用暂存区 && 有远程分支
  if (isTure(option.stash) && isrb) {
    // 输出日志
    BgWarning(`==== 注意：使用 stash 暂存代码，在有保存本地内容的情况下，如手动终止脚本、执行失败停止脚本，需检查是否执行了 $ git stash pop 命令，没有执行需要手动执行放出暂存区的代码，以免丢失！`)
    // 输出日志
    BgInfo(`========================================== git stash`)
    // 暂存代码
    const stashStdout = exec('git stash').stdout
    // 有内容暂存了
    if (stashStdout.includes('保存工作目录和索引状态') || stashStdout.includes('Saved working directory and index state')) {
      isStash = true
    }
    // 需要提交代码
    if (stashStdout.includes('needs merge')) {
      isNeedsMerge = true
    }
    // 暂存代码后
    if (isStash) {
      // 拉取最新代码
      pullBranch(cb, () => {
        // 输出日志
        BgInfo(`========================================== git stash pop`)
        // 释放暂存代码
        execCheck(`git stash pop`)
      })
    }
  }
  // 输出日志
  BgInfo(`========================================== git add .`)
  // 添加所有文件
  exec('git add .')
  // 输出日志
  BgInfo(`========================================== git commit -m "${option.message}"`)
  // 提交到本地
  exec(`git commit -m "${option.message}"`)
  // 有远程分支 && 无暂存代码 && 无需合并 && 非修复状态
  if (isrb && !isStash && !isNeedsMerge && !option.fix) {
    // 拉取最新代码
    pullBranch(cb)
  }
  // 输出日志
  BgInfo(`========================================== git push origin ${cb}`)
  // 提交到远程分支
  execCheck(`git push origin ${cb}`)
}

// 合并到指定分支
function mergeToBranch(option) {
  // 返回分支
  const gb = option.go
  // 目标分支
  const tb = option.to
  // 当前是否在目标分支
  if (cb != tb) {
    // 切换到指定目标分支
    goBranch(tb)
    // 拉取最新代码
    pullBranch(tb)
    // 输出日志
    BgInfo(`========================================== git merge ${cb}`)
    // 合并当前分支
    execCheck(`git merge ${cb}`)
    // 输出日志
    BgInfo(`========================================== git push origin ${tb}`)
    // 提交到远程分支
    execCheck(`git push origin ${tb}`)
    // 切换回到开发分支
    goBranch(gb)
  } else {
    // 指定分支有值
    if (gb) {
      // 切换到指定分支
      goBranch(gb)
    }
  }
}

// 拉取分支
function pullBranch(cb, callback) {
  // 输出日志
  BgInfo(`========================================== git pull origin ${cb}`)
  // 拉取最新代码
  const cmd = `git pull origin ${cb}`
  const res = exec(cmd)
  // 拉取失败，根据情况处理
  if (res.code != 0) {
    // 没有远程分支
    if (res.stderr.includes('无法找到远程引用') || res.stderr.includes("couldn't find remote ref")) {
      // 继续执行脚本
      if (callback) { callback(res) }
    } else {
      // 输出错误提示
      showError(cmd)
      // 回调
      if (callback) { callback(res) }
      // 结束脚本
      exit(res.code)
    }
  } else {
    // 回调
    if (callback) { callback(res) }
  }
}

// 修复分支偏移
function fixBranch(option) {
  // 有远程分支，才允许修复
  if (isrb) {
    // 修复分支
    const fb = `${fbPrefix}${cb}`
    // 新建修复分支
    newBranch(fb)
    // 移除当前分支
    delBranch(cb)
    // 拉取当前分支
    goBranch(cb)
    // 拉取最新代码
    pullBranch(cb)
    // 输出日志
    BgInfo(`========================================== git merge ${fb}`)
    // 合并修复分支
    execCheck(`git merge ${fb}`)
    // 移除修复分支
    delFixBranch(rbs, true)
    // 修复完成提交远程
    if (isTure(option.push)) {
      // 为修复分支
      option.fix = true
      // 提交当前分支
      pushCurrentBranch(option)
    }
  } else {
    // 输出日志
    BgError(`========================================== Error：${cb} 不存在远程分支，无法进行修复！`)
    // 结束脚本
    exit(1)
  }
}

// 移除修复分支
function delFixBranch(rbs, force) {
  // 修复分支
  const fb = `${fbPrefix}${cb}`
  // (本地存在修复分支 && 远程不存在修复分支) || 强制
  if ((lbs.includes(fb) && !rbs.includes(fb)) || force) {
    // 移除修复分支
    delBranch(fb)
  }
}

// 移除分支（isr：远程/本地）
function delBranch(cb, isr) {
  if (isr) {
    // 输出日志
    BgInfo(`========================================== git push origin -d ${cb}`)
    // 移除远程分支
    execCheck(`git push origin -d ${cb}`)
  } else {
    // 输出日志
    BgInfo(`========================================== git branch -D ${cb}`)
    // 移除本地分支
    execCheck(`git branch -D ${cb}`)
  }
}

// 新建分支
function newBranch(cb) {
  // 输出日志
  BgInfo(`========================================== git checkout -b ${cb}`)
  // 新建分支
  execCheck(`git checkout -b ${cb}`)
}

// 切换分支
function goBranch(cb) {
  // 输出日志
  BgInfo(`========================================== git checkout ${cb}`)
  // 切换/拉取分支
  execCheck(`git checkout ${cb}`)
}

// 执行其他命令
function execArgs(args) {
  // 数组有值
  if (args && args.length) {
    // git 命令拼接
    const gc = `git ${args.join(' ')}`
    // 输出日志
    BgInfo(`========================================== ${gc}`)
    // 执行命令
    exec(gc)
  }
}

// ================================================== 收尾工作

program
  // 版本信息
  .version(version)
  // 配置
  .option('-v', 'output the version number')
  .option('-d [branch]', '移除指定本地分支')
  .option('-dr [branch]', '移除指定远程分支')
  .option('-b [branch]', '以当前分支为基础，新建分支')
  .option('-c [branch]', '切换到指定分支，如本地没有会拉取远程分支')
  // 事件
  .action((opts, cmd) => {
    // 区分属性
    if (opts.v) {
      // 版本号
      console.log(version)
    } else if (opts.c) {
      // 切换分支
      goBranch(opts.c)
    } else if (opts.b) {
      // 新开分支
      newBranch(opts.b)
    } else if (opts.d) {
      // 移除本地分支
      delBranch(opts.d)
    } else if (opts.Dr) {
      // 移除远程分支
      delBranch(opts.Dr, true)
    } else {
      // 执行其他命令
      execArgs(cmd.args)
    }
  })
  // 解析参数
  .parse(process.argv)