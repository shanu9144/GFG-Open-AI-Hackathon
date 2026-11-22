var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');
var reports = require('../lib/reports');

function orderWith(items, coupon) {
  var totals = pricing.computeTotals(items, coupon || '');
  return {
    id: 17,
    date: '2026-11-22',
    customer: 'Test customer',
    coupon: coupon || '',
    items: items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total
  };
}

test('invoice resolves HSN GST when a line has no gstRate', function () {
  var result = invoice.computeInvoiceFigures({
    items: [{ name: 'Rice', hsn: '1006', price: 100, qty: 2 }]
  });

  assert.deepEqual(result, {
    subtotal: 200,
    discount: 0,
    tax: 10,
    cgst: 5,
    sgst: 5,
    total: 210,
    rows: [{
      name: 'Rice', sku: '-', hsn: '1006', qty: 2, price: 100,
      gstPercent: 5, line: 200, lineTax: 10
    }]
  });
});

test('invoice GST figures match the HSN slab and billed order total', function () {
  var items = [{ id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 2 }];
  var order = orderWith(items);
  var invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.equal(order.tax, 10);
  assert.equal(order.total, 210);
  assert.equal(invoiceFigures.tax, 10);
  assert.equal(invoiceFigures.total, 210);
});

test('invoice applies the same subtotal coupon discount and tax as order pricing', function () {
  var items = [{ id: 2, name: 'Grains', hsn: '1006', price: 100, qty: 10 }];
  var order = orderWith(items, 'SAVE10');
  var invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.equal(order.discount, 100);
  assert.equal(order.tax, 45);
  assert.equal(order.total, 945);
  assert.equal(invoiceFigures.discount, 100);
  assert.equal(invoiceFigures.tax, 45);
  assert.equal(invoiceFigures.total, 945);
});

test('GST reconciliation matches the invoice and ledger figures', function () {
  var order = orderWith([{ id: 3, name: 'Rice', hsn: '1006', price: 100, qty: 2 }]);
  var result = reports.getGstReconciliation({ orders: [order], products: [], customers: [] });

  assert.deepEqual(result, {
    totalChecked: 1,
    mismatchCount: 0,
    totalDelta: 0,
    rows: [{
      orderId: 17,
      date: '2026-11-22',
      customer: 'Test customer',
      coupon: '',
      ledgerSubtotal: 200,
      ledgerDiscount: 0,
      ledgerTax: 10,
      ledgerTotal: 210,
      invoiceDiscount: 0,
      invoiceTax: 10,
      invoiceTotal: 210,
      delta: 0,
      matched: true
    }]
  });
});

test('invoice HTML renders the billed total without a mismatch notice', function () {
  var order = orderWith([{ id: 4, name: 'Rice', hsn: '1006', price: 100, qty: 2 }]);
  var html = invoice.render(order);

  assert.match(html, /Invoice Total<\/td><td class="r">₹210\.00/);
  assert.doesNotMatch(html, /Accountant Reconciliation Notice/);
});
