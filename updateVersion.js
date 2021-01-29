#!/usr/bin/env node

/**
 * updateVersion.js
 * @description 通过命令来升级 npm 包
 * @param path 要升级的项目路径（包含 package.json 的路径）
 * @param type 发版类型（beta：测试包； release：正式包）
 * @param increment 版本升级类型 （major：大版本升级；minor：中版本升级，patch：补丁包（小版本））
 */

const fs = require('fs');
const exec = require('child_process').exec;
const argv = process.argv.slice(2);

/**
 * @description 版本升级类型
 * @param MAJOR 大版本升级
 * @param MINOR 中（小）版本升级
 * @param PATCH 补丁包
 */
const INCREMENT_ENUMS = {
  MAJOR: 'major',
  MINOR: 'minor',
  PATCH: 'patch',
};

/**
 * @description 发包类型
 * @param BETA 测试包
 * @param RELEASE 正式包
 */
const PUBLISH_ENUMS = {
  BETA: 'beta',
  RELEASE: 'release',
};

/**
 * @description 解析命令参数 获取发布类型、项目路径
 * @param {Array} argv 命令参数数组
 */
function calcArgvs(argv) {
  let result = {};
  argv.map((arg) => {
    const arr = arg.split('=');
    result[arr[0]] = arr[1];
  });
  return result;
}

/**
 * @description 获取新的版本号
 * @param {String} version 旧的版本号
 * @param {String} type 发包类型
 * @param {String} increment 版本升级类型
 * @returns 新的版本号
 */
function getNewVersion(version, type, increment) {
  const versionArr_bat = version.split('.');
  let [majorNum, minorNum, patchModule, betaNum] = versionArr_bat;
  let [patchNum] = patchModule.split('-');

  // 如果原版本是 beta，则不需要进行主版本号的累加
  if (betaNum) {
    // 要发的版本是 beta，需要 beta号累加
    if (type === PUBLISH_ENUMS.BETA) {
      return calcBetaVersion(version);
      // 要发的版本是 release，则直接把原有的 -beta.* 去掉就ok
    } else if (type === PUBLISH_ENUMS.RELEASE) {
      return [majorNum, minorNum, patchNum].join('.');
    }
  }

  switch (increment) {
    // 大版本升级
    case INCREMENT_ENUMS.MAJOR:
      majorNum = parseInt(majorNum) + 1;
      break;
    // 种版本升级
    case INCREMENT_ENUMS.MINOR:
      minorNum = parseInt(minorNum) + 1;
      break;
    // 小版本升级
    case INCREMENT_ENUMS.PATCH:
      patchNum = parseInt(patchNum) + 1;
      break;
    default:
      break;
  }

  if (type === PUBLISH_ENUMS.BETA) {
    return calcBetaVersion([majorNum, minorNum, patchNum].join('.'));
  } else if (type === PUBLISH_ENUMS.RELEASE) {
    return [majorNum, minorNum, patchNum].join('.');
  }
}

/**
 * @description 通过旧的版本号获取新的 beta 版本号
 * @param {String} version 旧的版本号
 */
function calcBetaVersion(version) {
  const reg = new RegExp(`(\\d+)-${PUBLISH_ENUMS.BETA}\.(\\d+)$`, 'g');
  return reg.test(version)
    ? version.replace(reg, (str, $1, $2) => {
        const [prefix, num] = str.split('.');
        return `${prefix}.${parseInt(num) + 1}`;
      })
    : `${version}-${PUBLISH_ENUMS.BETA}.0`;
}

/**
 * @description 把新内容写入package.json
 * @param {*} pkg 修改后的package.json
 * @param {String} pkgPath 要修改的package.json的路径
 */
function writePackageJson(pkg, pkgPath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      `${pkgPath}/package.json`,
      JSON.stringify(pkg),
      function (err) {
        if (err) reject(err);

        resolve();
      }
    );
  });
}

// 获取命令参数
const { type, path: projectPath, increment } = calcArgvs(argv);
const pkg = require(`${projectPath}/package.json`);
const version = pkg.version;
pkg.version = getNewVersion(version, type, increment);

writePackageJson(pkg, projectPath).then(() => {
  console.log('这里执行自己的命令');
  exec(
    `npm run ${type === PUBLISH_ENUMS.BETA ? 'beta' : 'pub'}`,
    function (error, stdout, stderr) {
      console.log(`${projectPath} 升级成功~`);
    }
  );
});
