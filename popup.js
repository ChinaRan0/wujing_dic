// DOM元素
const domainInput = document.getElementById('domainInput');
const domainHint = document.getElementById('domainHint');
const keywordInput = document.getElementById('keywordInput');
const optYearLower = document.getElementById('optYearLower');
const optYearCapital = document.getElementById('optYearCapital');
const optSuffix = document.getElementById('optSuffix');
const suffixList = document.getElementById('suffixList');
const yearStart = document.getElementById('yearStart');
const yearEnd = document.getElementById('yearEnd');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const resultOutput = document.getElementById('resultOutput');
const resultCount = document.getElementById('resultCount');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const refreshDomainBtn = document.getElementById('refreshDomainBtn');
const resetSuffixBtn = document.getElementById('resetSuffixBtn');
const optMultiSep = document.getElementById('optMultiSep');
const optNoSep = document.getElementById('optNoSep');
const optUppercase = document.getElementById('optUppercase');
const optAccountPrefix = document.getElementById('optAccountPrefix');
const optReverse = document.getElementById('optReverse');
const optEnterprise = document.getElementById('optEnterprise');
const noSepSuffixList = document.getElementById('noSepSuffixList');
const accountPrefixList = document.getElementById('accountPrefixList');
const enterpriseSuffixList = document.getElementById('enterpriseSuffixList');
const resetNoSepBtn = document.getElementById('resetNoSepBtn');
const resetAccountBtn = document.getElementById('resetAccountBtn');
const resetEnterpriseBtn = document.getElementById('resetEnterpriseBtn');

// 初始化后缀列表
suffixList.value = DEFAULT_SUFFIXES.join('\n');
noSepSuffixList.value = DEFAULT_NO_SEP_SUFFIXES.join('\n');
accountPrefixList.value = DEFAULT_ACCOUNT_PREFIXES.join('\n');
enterpriseSuffixList.value = DEFAULT_ENTERPRISE_SUFFIXES.join('\n');

// 重置后缀
resetSuffixBtn.addEventListener('click', () => {
  suffixList.value = DEFAULT_SUFFIXES.join('\n');
});

resetNoSepBtn.addEventListener('click', () => {
  noSepSuffixList.value = DEFAULT_NO_SEP_SUFFIXES.join('\n');
});

resetAccountBtn.addEventListener('click', () => {
  accountPrefixList.value = DEFAULT_ACCOUNT_PREFIXES.join('\n');
});

resetEnterpriseBtn.addEventListener('click', () => {
  enterpriseSuffixList.value = DEFAULT_ENTERPRISE_SUFFIXES.join('\n');
});

// 从域名提取关键字
function extractDomainKeyword(hostname) {
  if (!hostname) return '';

  // 如果是IP地址，返回空
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
      /^[0-9a-fA-F:]+$/.test(hostname)) {
    domainHint.textContent = '检测到IP地址，无法提取域名关键字';
    return '';
  }

  // 移除常见的www前缀
  let domain = hostname.replace(/^www\./, '');

  // 分割域名
  const parts = domain.split('.');

  if (parts.length < 1) return '';

  // 已知的二级域名后缀（如 .com.cn, .edu.cn, .gov.cn 等）
  const secondLevelTLDs = new Set([
    'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn', 'mil.cn',
    'ac.cn', 'bj.cn', 'sh.cn', 'tj.cn', 'cq.cn', 'he.cn', 'sx.cn',
    'nm.cn', 'ln.cn', 'jl.cn', 'hl.cn', 'js.cn', 'zj.cn', 'ah.cn',
    'fj.cn', 'jx.cn', 'sd.cn', 'ha.cn', 'hb.cn', 'hn.cn', 'gd.cn',
    'gx.cn', 'hi.cn', 'sc.cn', 'gz.cn', 'yn.cn', 'xz.cn', 'sn.cn',
    'gs.cn', 'qh.cn', 'nx.cn', 'xj.cn', 'tw.cn', 'hk.cn', 'mo.cn',
    'com.hk', 'net.hk', 'org.hk', 'gov.hk',
    'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'net.uk',
    'co.jp', 'or.jp', 'ne.jp', 'ac.jp', 'go.jp',
    'com.tw', 'net.tw', 'org.tw', 'gov.tw',
    'com.sg', 'net.sg', 'org.sg', 'gov.sg',
    'co.kr', 'or.kr', 'ne.kr', 'go.kr',
  ]);

  // 检查是否为特殊二级域名
  if (parts.length >= 3) {
    const lastTwo = parts[parts.length - 2] + '.' + parts[parts.length - 1];
    if (secondLevelTLDs.has(lastTwo)) {
      // 如 baidu.com.cn → baidu
      // 如 lydx.edu.cn → lydx
      return parts[parts.length - 3];
    }
  }

  // 常规域名：取倒数第二段（主域名部分）
  // baidu.com → baidu, zj.gov.cn → zj（.gov.cn是特殊二级后缀）
  if (parts.length >= 2) {
    // 再检查一次是否有二级TLD
    if (parts.length >= 3) {
      const lastTwo = parts[parts.length - 2] + '.' + parts[parts.length - 1];
      if (secondLevelTLDs.has(lastTwo)) {
        return parts[parts.length - 3];
      }
    }
    return parts[parts.length - 2];
  }

  // 单段域名就直接返回
  return parts[0];
}

// 获取当前tab域名
async function getCurrentDomain() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const hostname = url.hostname;
      domainInput.value = hostname;
      const keyword = extractDomainKeyword(hostname);
      domainHint.textContent = keyword ? '提取关键字: ' + keyword : domainHint.textContent;
      return keyword;
    }
  } catch (e) {
    domainInput.value = '无法获取域名';
  }
  return '';
}

// 处理关键字输入
function processKeywords(rawInput) {
  if (!rawInput.trim()) return [];

  const items = rawInput.split(/[,，、\s]+/).filter(Boolean);
  const results = [];

  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    if (hasChinese(trimmed)) {
      // 包含中文，转拼音
      const pinyin = toPinyin(trimmed);
      if (pinyin) results.push(pinyin.toLowerCase());
    } else {
      // 纯英文/数字，保持原样
      results.push(trimmed.toLowerCase());
    }
  }

  return [...new Set(results)]; // 去重
}

// 获取后缀列表
function getSuffixes() {
  return suffixList.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

function getNoSepSuffixes() {
  return noSepSuffixList.value.split('\n').map(s => s.trim()).filter(Boolean);
}

function getAccountPrefixes() {
  return accountPrefixList.value.split('\n').map(s => s.trim()).filter(Boolean);
}

function getEnterpriseSuffixes() {
  return enterpriseSuffixList.value.split('\n').map(s => s.trim()).filter(Boolean);
}

// 统一大小写变体：lower(必须), Capitalized(如不同), UPPERCASE(如启用且不同)
function applyCaseVariants(data, includeUppercase, callback) {
  callback(data);
  const cap = capitalize(data);
  if (cap !== data) callback(cap);
  if (includeUppercase) {
    const upper = data.toUpperCase();
    if (upper !== data && upper !== cap) callback(upper);
  }
}

// 生成年份密码
function generateYearPasswords(dataItems, startYear, endYear, includeUppercase) {
  const passwords = [];

  for (const data of dataItems) {
    // {data}@年份 小写
    if (optYearLower.checked) {
      for (let y = startYear; y <= endYear; y++) {
        passwords.push(data + '@' + y);
      }
    }

    // {Data}@年份 首字母大写
    if (optYearCapital.checked) {
      const capData = capitalize(data);
      if (capData !== data) {
        for (let y = startYear; y <= endYear; y++) {
          passwords.push(capData + '@' + y);
        }
      }
    }

    // {DATA}@年份 全大写
    if (includeUppercase && (optYearLower.checked || optYearCapital.checked)) {
      const upperData = data.toUpperCase();
      const capData = capitalize(data);
      if (upperData !== data && upperData !== capData) {
        for (let y = startYear; y <= endYear; y++) {
          passwords.push(upperData + '@' + y);
        }
      }
    }
  }

  return passwords;
}

// 生成后缀密码
function generateSuffixPasswords(dataItems, suffixes, includeUppercase) {
  const passwords = [];

  for (const data of dataItems) {
    if (optSuffix.checked) {
      for (const suffix of suffixes) {
        passwords.push(data + '@' + suffix);
        const capData = capitalize(data);
        if (capData !== data) {
          passwords.push(capData + '@' + suffix);
        }
        if (includeUppercase) {
          const upperData = data.toUpperCase();
          if (upperData !== data && upperData !== capData) {
            passwords.push(upperData + '@' + suffix);
          }
        }
      }
    }
  }

  return passwords;
}

// 规则1: {data}#YYYY, {data}_YYYY, {data}-YYYY, {data}.YYYY 多分隔符
function generateMultiSepPasswords(dataItems, startYear, endYear, includeUppercase) {
  if (!optMultiSep.checked) return [];
  const passwords = [];
  const separators = ['#', '_', '-', '.'];
  for (const data of dataItems) {
    applyCaseVariants(data, includeUppercase, (variant) => {
      for (const sep of separators) {
        for (let y = startYear; y <= endYear; y++) {
          passwords.push(variant + sep + y);
        }
      }
    });
  }
  return passwords;
}

// 规则2: {data}2025, {data}123456 无分隔符直接拼接
function generateNoSepPasswords(dataItems, noSepSuffixes, includeUppercase) {
  if (!optNoSep.checked) return [];
  const passwords = [];
  for (const data of dataItems) {
    applyCaseVariants(data, includeUppercase, (variant) => {
      for (const suffix of noSepSuffixes) {
        passwords.push(variant + suffix);
      }
    });
  }
  return passwords;
}

// 规则4: admin@{data}, root@{data}, sa@{data} 账号前缀
function generateAccountPrefixPasswords(dataItems, accounts, includeUppercase) {
  if (!optAccountPrefix.checked) return [];
  const passwords = [];
  for (const data of dataItems) {
    applyCaseVariants(data, includeUppercase, (variant) => {
      for (const account of accounts) {
        passwords.push(account + '@' + variant);
      }
    });
  }
  return passwords;
}

// 规则5: YYYY@{data}, suffix@{data} 反转顺序
function generateReversePasswords(dataItems, startYear, endYear, suffixes, includeUppercase) {
  if (!optReverse.checked) return [];
  const passwords = [];
  for (const data of dataItems) {
    applyCaseVariants(data, includeUppercase, (variant) => {
      for (let y = startYear; y <= endYear; y++) {
        passwords.push(y + '@' + variant);
      }
      for (const suffix of suffixes) {
        passwords.push(suffix + '@' + variant);
      }
    });
  }
  return passwords;
}

// 规则6: {data}@123.com, {data}@qq.com, {data}pwd 企业后缀
function generateEnterprisePasswords(dataItems, enterpriseSuffixes, includeUppercase) {
  if (!optEnterprise.checked) return [];
  const passwords = [];
  for (const data of dataItems) {
    applyCaseVariants(data, includeUppercase, (variant) => {
      for (const suffix of enterpriseSuffixes) {
        passwords.push(variant + suffix);
      }
    });
  }
  return passwords;
}

// 主生成逻辑
function generatePasswords() {
  const domainKeyword = extractDomainKeyword(domainInput.value);
  const customKeywords = processKeywords(keywordInput.value);

  // 合并域名关键字和自定义关键字
  const allKeywords = [];
  if (domainKeyword) allKeywords.push(domainKeyword);
  allKeywords.push(...customKeywords);

  if (allKeywords.length === 0) {
    resultOutput.value = '请先打开一个网页以获取域名，或输入自定义关键字';
    resultSection.style.display = 'block';
    resultCount.textContent = '0';
    return;
  }

  const startYear = parseInt(yearStart.value) || 2010;
  const endYear = parseInt(yearEnd.value) || 2026;
  const suffixes = getSuffixes();
  const noSepSuffixes = getNoSepSuffixes();
  const accounts = getAccountPrefixes();
  const enterpriseSuffixes = getEnterpriseSuffixes();
  const includeUppercase = optUppercase.checked;

  const passwords = [];
  // 已有规则
  passwords.push(...generateYearPasswords(allKeywords, startYear, endYear, includeUppercase));
  passwords.push(...generateSuffixPasswords(allKeywords, suffixes, includeUppercase));
  // 新规则
  passwords.push(...generateMultiSepPasswords(allKeywords, startYear, endYear, includeUppercase));
  passwords.push(...generateNoSepPasswords(allKeywords, noSepSuffixes, includeUppercase));
  passwords.push(...generateAccountPrefixPasswords(allKeywords, accounts, includeUppercase));
  passwords.push(...generateReversePasswords(allKeywords, startYear, endYear, suffixes, includeUppercase));
  passwords.push(...generateEnterprisePasswords(allKeywords, enterpriseSuffixes, includeUppercase));

  // 去重并排序
  const uniquePasswords = [...new Set(passwords)].sort();

  if (uniquePasswords.length === 0) {
    resultOutput.value = '没有生成任何密码，请检查生成选项';
    resultSection.style.display = 'block';
    resultCount.textContent = '0';
    return;
  }

  resultOutput.value = uniquePasswords.join('\n');
  resultCount.textContent = uniquePasswords.length;
  resultSection.style.display = 'block';
}

// 复制全部
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultOutput.value);
    const orig = copyBtn.textContent;
    copyBtn.textContent = '已复制!';
    copyBtn.style.color = '#4caf50';
    setTimeout(() => {
      copyBtn.textContent = orig;
      copyBtn.style.color = '';
    }, 1500);
  } catch {
    // fallback
    resultOutput.select();
    document.execCommand('copy');
    copyBtn.textContent = '已复制!';
    setTimeout(() => { copyBtn.textContent = '复制全部'; }, 1500);
  }
});

// 下载TXT
downloadBtn.addEventListener('click', () => {
  const content = resultOutput.value;
  if (!content) return;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const ts = new Date().toISOString().slice(0, 10);
  a.download = 'weak_passwords_' + ts + '.txt';
  a.click();
  URL.revokeObjectURL(url);
});

// 生成按钮
generateBtn.addEventListener('click', generatePasswords);

// 刷新域名
refreshDomainBtn.addEventListener('click', () => {
  domainHint.textContent = '';
  getCurrentDomain();
});

// 页面加载时自动获取域名
document.addEventListener('DOMContentLoaded', () => {
  getCurrentDomain();
});
