import React from 'react';
import PropTypes from 'prop-types';
import { Printer, Text, Row, Cut, render } from 'react-thermal-printer';
import { calculateTotals, formatPrice } from './utils/calcTotals';

const ReceiptPrinter = ({ cartItems, discount = 0, tax = 0, onPrintComplete }) => {
  // دالة لطباعة الفاتورة
  const printReceipt = async () => {
    const { total } = calculateTotals(cartItems, discount, tax);

    // إعداد محتوى الفاتورة باستخدام مكونات react-thermal-printer
    const receipt = (
      <Printer type="epson" width={48}>
        <Text size={{ width: 2, height: 2 }}>فاتورة الدفع</Text>
        <Row left="المنتج" right="السعر" />
        <Text>-----------------------------</Text>
        {cartItems.map((item) => (
          <Row
            key={item.product.id}
            left={`${item.product.name} x ${item.quantity}`}
            right={`${formatPrice(item.product.price * item.quantity)} ر.س`}
          />
        ))}
        <Text>-----------------------------</Text>
        <Row left="الإجمالي" right={`${formatPrice(total)} ر.س`} />
        {/* قطع الورقة بعد الطباعة */}
        <Cut />
      </Printer>
    );

    // توليد بيانات الطباعة (Uint8Array)
    const data = await render(receipt);
    console.log(data); // يمكن إرسال البيانات هذه إلى الطابعة الفعلية
    if (onPrintComplete) {
      onPrintComplete();
    }
  };


  return (
    <div className="receipt-printer-container">
      {/* زر لطباعة الفاتورة */}
      <button className="print-button" onClick={printReceipt}>طباعة الفاتورة</button>
    </div>
  );
};

ReceiptPrinter.propTypes = {
  cartItems: PropTypes.array.isRequired,
  discount: PropTypes.number,
  tax: PropTypes.number,
  onPrintComplete: PropTypes.func,
};

export default ReceiptPrinter;
