// Run from the project root: node assets/app.test.cjs
const assert = require('node:assert/strict');
const YJ = require('./app.js');
let saved = null;
globalThis.localStorage = {
  getItem: () => saved,
  setItem: (_key, value) => { saved = value; }
};
const p = YJ.product('p1');
const price = qty => YJ.quote(p, qty)?.unit;
assert.equal(price(49), undefined);
assert.equal(price(50), 1480);
assert.equal(price(499), 1480);
assert.equal(price(500), 1250);
assert.equal(price(1999), 1250);
assert.equal(price(2000), 1080);
assert.equal(price(3201), undefined);
assert.equal(price(500.5), undefined);
assert.equal(YJ.quote(p, 500).total, 625000);
assert.equal(YJ.quote(p, 500, YJ.skuFor(p, 'white')).unit, 1280);
assert.equal(YJ.quote(p, 500, YJ.skuFor(p, 'large')), null);
assert.equal(YJ.state().cart.reduce((total, line) => {
  const item = YJ.product(line.id);
  return total + YJ.quote(item, line.qty, YJ.skuFor(item, line.sku)).total;
}, 0), 961000);
assert.equal(YJ.addCart(p, p.skus[0], 500), '已加入采购车');
assert.equal(YJ.state().cart[0].qty, 1000);
assert.equal(YJ.state().cart.length, 2);
assert.equal(YJ.addCart(p, p.skus[1], 500), '已加入采购车');
assert.equal(YJ.state().cart.length, 3);
assert.notEqual(YJ.addCart(p, p.skus[0], 3000), '已加入采购车');
assert.equal(YJ.state().cart[0].qty, 1000);
assert.equal(YJ.addBasket(['p1', 'p1']), '已加入询价篮');
assert.equal(YJ.state().basket.length, 2);
assert.match(YJ.addBasket(YJ.catalog.map(item => item.id)), /最多 8/);
assert.equal(YJ.submitBasket(['p1'], '测试报价'), '已提交 1 条模拟询盘');
assert.deepEqual(YJ.state().basket.map(item => item.id), ['p5']);
assert.equal(YJ.state().records[0].status, '待回复');
assert.equal(YJ.state().records[0].note, '测试报价');
YJ.save({ cart: [], basket: [], records: [] });
assert.deepEqual(YJ.state(), { cart: [], basket: [], records: [] });
saved = '{';
assert.equal(YJ.state().cart.length, 2);
console.log('通过：阶梯价、SKU 库存、采购车、询价篮及本地存储。');
