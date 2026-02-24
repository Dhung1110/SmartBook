document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Lấy ID hóa đơn từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    
    if (!invoiceId) {
        window.location.href = 'customer-dashboard.html';
        return;
    }

    // Lấy thông tin hóa đơn
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const invoice = invoices.find(inv => inv.id === invoiceId);
    
    if (!invoice || invoice.userId !== currentUser.id) {
        window.location.href = 'customer-dashboard.html';
        return;
    }

    // Hiển thị thông tin hóa đơn
    document.getElementById('invoiceId').textContent = `Mã hóa đơn: ${invoice.id}`;
    document.getElementById('invoiceDate').textContent = `Ngày: ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}`;

    // Hiển thị thông tin khách hàng
    const customerDetails = document.getElementById('customerDetails');
    customerDetails.innerHTML = `
        <p><strong>Họ và tên:</strong> ${invoice.customerInfo.fullName}</p>
        <p><strong>Số điện thoại:</strong> ${invoice.customerInfo.phone}</p>
        <p><strong>Email:</strong> ${invoice.customerInfo.email}</p>
        <p><strong>Địa chỉ:</strong> ${invoice.customerInfo.address}</p>
    `;

    // Hiển thị chi tiết đơn hàng
    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = invoice.items.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 70px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <div style="font-weight: 500;">${item.title}</div>
                        <div style="color: #666; font-size: 14px;">${item.author}</div>
                    </div>
                </div>
            </td>
            <td>${item.price.toLocaleString()}đ</td>
            <td>${item.quantity}</td>
            <td>${item.subtotal.toLocaleString()}đ</td>
        </tr>
    `).join('');

    // Hiển thị tổng kết
    document.getElementById('subtotal').textContent = invoice.subtotal.toLocaleString() + 'đ';
    document.getElementById('discount').textContent = '-' + invoice.discount.toLocaleString() + 'đ';
    document.getElementById('shipping').textContent = invoice.shipping.toLocaleString() + 'đ';
    document.getElementById('total').textContent = invoice.total.toLocaleString() + 'đ';

    // Hiển thị thông tin thanh toán
    document.getElementById('paymentMethod').textContent = invoice.paymentMethod === 'cod' 
        ? 'Thanh toán khi nhận hàng (COD)' 
        : 'Chuyển khoản ngân hàng';
    document.getElementById('paymentStatus').textContent = invoice.status === 'paid'
        ? 'Trạng thái: Đã thanh toán'
        : 'Trạng thái: Chưa thanh toán';

    // Xử lý nút in hóa đơn
    document.getElementById('printInvoice').addEventListener('click', function() {
        window.print();
    });

    // Xử lý nút tải PDF
    document.getElementById('downloadInvoice').addEventListener('click', function() {
        // Tạo PDF từ HTML
        const element = document.querySelector('.invoice-container');
        const opt = {
            margin: 1,
            filename: `hoa-don-${invoice.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Sử dụng html2pdf.js để tạo PDF
        html2pdf().set(opt).from(element).save();
    });
}); 