// Khởi tạo dữ liệu mẫu cho tài khoản admin
const accounts = {
    admin: {
        id: 1,
        username: 'admin', 
        password: 'admin123',
        role: 'manager',
        name: 'Quản lý'
    },
    nhanvien: {
        id: 2,
        username: 'nhanvien', 
        password: 'nhanvien123',
        role: 'staff',
        email:'nhanvien@gmail.com',
        name: 'nhanvien'
    }
};

// Tự động lưu tài khoản admin và nhân viên mẫu vào localStorage nếu chưa có
if (!localStorage.getItem('staffUsers')) {
    // Bao gồm cả admin và nhanvien trong mảng khởi tạo
    const staffUsers = [accounts.admin, accounts.nhanvien]; 
    localStorage.setItem('staffUsers', JSON.stringify(staffUsers));
    console.log('Đã khởi tạo dữ liệu tài khoản admin và nhân viên mẫu');
}


document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('staffLoginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    // Xử lý hiện/ẩn mật khẩu
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    } else {
        console.error('Không tìm thấy phần tử mật khẩu hoặc nút toggle.');
    }

    // Xử lý đăng nhập
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
    
            // Lấy danh sách nhân viên từ localStorage
            const staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
            
            // Tìm tài khoản trong danh sách staffUsers
            const account = staffList.find(user => user.username === username);
            
            // Kiểm tra thông tin đăng nhập
            if (account && account.password === password) {
                // Dữ liệu người dùng để lưu vào staffUser (lấy từ tài khoản tìm được)
                const userData = {
                    id: account.id, 
                    username: account.username,
                    role: account.role,
                    name: account.name,
                    email: account.email || `${account.username}@example.com`, // Giữ lại email/phone mẫu nếu có
                    phone: account.phone || '0123456789',
                    password: account.password // Lưu password để có thể dùng cho chức năng đổi MK sau này
                };
                
                // Lưu thông tin đăng nhập hiện tại
                if (remember) {
                    localStorage.setItem('staffUser', JSON.stringify(userData));
                } else {
                    sessionStorage.setItem('staffUser', JSON.stringify(userData));
                }
    
                // Không cần cập nhật lại danh sách staffUsers ở đây vì ta đang ĐỌC từ nó để xác thực
    
                // Hiển thị thông báo thành công
                showNotification('success', 'Đăng nhập thành công', 'Đang chuyển hướng...');
                
                // Chuyển hướng dựa trên vai trò
                setTimeout(() => {
                    if (account.role === 'manager') {
                        window.location.href = 'manager-dashboard.html';
                    } else {
                        // Mặc định chuyển đến staff dashboard nếu không phải manager
                        window.location.href = 'staff-dashboard.html'; 
                    }
                }, 1500);
            } else {
                // Thông báo thất bại
                showNotification('error', 'Đăng nhập thất bại', 'Tên đăng nhập hoặc mật khẩu không chính xác');
                // Hiệu ứng rung lắc form (giữ nguyên)
                if(loginForm) {
                    loginForm.classList.add('shake');
                    setTimeout(() => loginForm.classList.remove('shake'), 500);
                }
            }
        });
    } else {
         console.error('Không tìm thấy form đăng nhập.');
    }
});

// Hàm hiển thị thông báo
function showNotification(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `notification-popup ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-progress">
            <div class="notification-progress-bar"></div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('slideOut');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 