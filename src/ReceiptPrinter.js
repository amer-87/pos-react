import React from 'react';
import { Printer, Text, Row, Cut, render } from 'react-thermal-printer';

const ReceiptPrinter = ({ cartItems, onPrintComplete }) => {
  // دالة لطباعة الفاتورة
  const printReceipt = async () => {
    // حساب الإجمالي الكلي قبل الطباعة
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
 
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
            right={`${item.product.price * item.quantity} د.ج`}
          />
        ))}
        <Text>-----------------------------</Text>
        <Row left="الإجمالي" right={`${total} د.ج`} />
        {/* قطع الورقة بعد الطباعة */}
        <Cut />
      </Printer>
    );

    // توليد بيانات الطباعة (Uint8Array)
    const data = await render(receipt);
    console.log(data); // يمكن إرسال البيانات هذه إلى الطابعة الفعلية
    alert('تمت طباعة الفاتورة بنجاح');
    if (onPrintComplete) {
      onPrintComplete();
    }
  };

  return (
    <div>
      {/* زر لطباعة الفاتورة */}
      <button onClick={printReceipt}>طباعة الفاتورة</button>
    </div>
  );
};

export default ReceiptPrinter;
