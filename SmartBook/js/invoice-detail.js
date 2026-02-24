document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra đăng nhập
    const user = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
    if (!user) {
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

    // Lấy thông tin hóa đơn từ localStorage
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const invoice = invoices.find(i => i.id === invoiceId);

    if (!invoice) {
        window.location.href = 'customer-dashboard.html';
        return;
    }

    // Cập nhật nút quay lại
    document.getElementById('backToOrder').href = `order-detail.html?id=${invoice.orderId}`;

    // Hiển thị thông tin hóa đơn
    displayInvoiceInfo(invoice);
    displayCustomerInfo(invoice.customerInfo);
    displayItems(invoice.items);
    displaySummary(invoice);
    displayPaymentInfo(invoice);
    setupActions(invoice);
});

function displayInvoiceInfo(invoice) {
    document.getElementById('invoiceId').textContent = `Mã hóa đơn: ${invoice.id}`;
    document.getElementById('invoiceDate').textContent = `Ngày tạo: ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}`;
    document.getElementById('orderReference').textContent = `Mã đơn hàng: ${invoice.orderId}`;
}

function displayCustomerInfo(customerInfo) {
    document.getElementById('customerDetails').innerHTML = `
        <p><strong>Họ tên:</strong> ${customerInfo.fullName}</p>
        <p><strong>Email:</strong> ${customerInfo.email}</p>
        <p><strong>Số điện thoại:</strong> ${customerInfo.phone}</p>
    `;

    document.getElementById('shippingDetails').innerHTML = `
        <p><strong>Địa chỉ:</strong> ${customerInfo.address}</p>
        ${customerInfo.note ? `<p><strong>Ghi chú:</strong> ${customerInfo.note}</p>` : ''}
    `;
}

function displayItems(items) {
    const tbody = document.getElementById('itemsList');
    tbody.innerHTML = items.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <div class="item-info">
                    <strong>${item.title}</strong>
                    <p class="author">${item.author}</p>
                </div>
            </td>
            <td>${formatCurrency(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.price * item.quantity)}</td>
        </tr>
    `).join('');
}

function displaySummary(invoice) {
    // Tính toán các giá trị
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = invoice.discount || 0;
    const shipping = invoice.shipping || 30000;
    const total = subtotal - discount + shipping;

    // Cập nhật hiển thị
    const summaryContainer = document.querySelector('.invoice-summary');
    summaryContainer.innerHTML = `
        <div class="summary-row">
            <span>Tạm tính:</span>
            <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-row">
            <span>Giảm giá:</span>
            <span>-${formatCurrency(discount)}</span>
        </div>
        <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span>${formatCurrency(shipping)}</span>
        </div>
        <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span>${formatCurrency(total)}</span>
        </div>
        <div class="total-in-words">
            Bằng chữ: ${numberToWords(total)} đồng
        </div>
    `;
}

function displayPaymentInfo(invoice) {
    const paymentText = invoice.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán trực tuyến';
    document.getElementById('paymentMethod').textContent = paymentText;

    const statusText = invoice.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán';
    const statusClass = invoice.status === 'paid' ? 'paid' : 'pending';
    document.getElementById('paymentStatus').innerHTML = `
        <span class="status ${statusClass}">${statusText}</span>
    `;
}

function setupActions(invoice) {
    // Xử lý nút in hóa đơn
    document.getElementById('printInvoice').addEventListener('click', () => {
        window.print();
    });

    // Xử lý nút tải PDF
    document.getElementById('downloadInvoice').addEventListener('click', () => {
        // TODO: Implement PDF download
        alert('Tính năng tải PDF đang được phát triển');
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Hàm chuyển số thành chữ
function numberToWords(number) {
    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const positions = ["", "nghìn", "triệu", "tỷ"];

    function readGroup(group) {
        let result = "";
        const hundreds = Math.floor(group / 100);
        const tens = Math.floor((group % 100) / 10);
        const ones = group % 10;

        if (hundreds > 0) {
            result += units[hundreds] + " trăm ";
        }

        if (tens > 0) {
            if (tens === 1) {
                result += "mười ";
            } else {
                result += units[tens] + " mươi ";
            }
        }

        if (ones > 0) {
            if (tens === 0 && hundreds !== 0) {
                result += "lẻ ";
            }
            if (ones === 1 && tens > 1) {
                result += "mốt ";
            } else if (ones === 5 && tens > 0) {
                result += "lăm ";
            } else {
                result += units[ones] + " ";
            }
        }

        return result;
    }

    if (number === 0) return "không";

    const groups = [];
    while (number > 0) {
        groups.push(number % 1000);
        number = Math.floor(number / 1000);
    }

    let result = "";
    for (let i = groups.length - 1; i >= 0; i--) {
        if (groups[i] !== 0) {
            result += readGroup(groups[i]) + positions[i] + " ";
        }
    }

    // Xử lý chuỗi kết quả
    result = result.trim()
        .replace(/\s+/g, ' ')
        .replace(/ $/g, '')
        .replace(/^một nghìn/g, 'một nghìn')
        .replace(/triệu nghìn/g, 'triệu')
        .replace(/tỷ triệu/g, 'tỷ')
        .replace(/tỷ nghìn/g, 'tỷ');

    return result.charAt(0).toUpperCase() + result.slice(1);
} 