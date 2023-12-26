const assert = require("assert");

// 两个qq的组合，会产出唯一一个数据表名，无论先后
function getSqlUniqueDataBaseName(qq1, qq2) {
  let res = "";
  let min;
  let max;
  if (qq1.length > qq2.length) {
    min = qq2;
    max = qq1;
  } else {
    min = qq1;
    max = qq2;
  }
  let i = 0;
  for (; i < min.length; i++) {
    const temp =
      Number(qq1[i]) > Number(qq2[i]) ? qq1[i] + qq2[i] : qq2[i] + qq1[i];
    res += temp;
  }
  if (i !== max.length) {
    res += max.slice(i);
  }
  return res;
}

// 单元测试
function testGetSqlUniqueDataBaseName() {
  // 测试用例1
  assert.strictEqual(getSqlUniqueDataBaseName("123", "456"), "415263");
  assert.strictEqual(getSqlUniqueDataBaseName("456", "123"), "415263");

  // 测试用例2
  assert.strictEqual(
    getSqlUniqueDataBaseName("987321", "65432"),
    "96857433221"
  );
  assert.strictEqual(
    getSqlUniqueDataBaseName("65432", "987321"),
    "96857433221"
  );
  assert.strictEqual(getSqlUniqueDataBaseName("20000", "222"), "22202000");
  console.log("测试通过");
}

// 运行测试
// testGetSqlUniqueDataBaseName();

module.exports = getSqlUniqueDataBaseName;
