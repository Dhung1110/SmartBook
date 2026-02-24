document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const socialButtons = document.querySelectorAll('.social-btn');
    const rememberMe = document.getElementById('rememberMe');

    // Xử lý hiện/ẩn mật khẩu
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    }

    // Tạm thời vô hiệu hóa đăng nhập mạng xã hội
    socialButtons.forEach(button => {
        button.classList.add('disabled');
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Tính năng này đang được phát triển!');
        });
    });

    // Kiểm tra và điền thông tin đã lưu
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('password').value = savedPassword;
        if (rememberMe) rememberMe.checked = true;
    }

    // Hàm hiển thị thông báo
    function showNotification(title, message, type = 'success') {
        // Xóa thông báo cũ nếu có
        const existingNotification = document.querySelector('.notification-popup');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Tạo thông báo mới
        const notification = document.createElement('div');
        notification.className = `notification-popup ${type}`;
        
        // Icon
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        
        // Nội dung
        const content = document.createElement('div');
        content.className = 'notification-content';
        
        const titleElement = document.createElement('div');
        titleElement.className = 'notification-title';
        titleElement.textContent = title;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        
        content.appendChild(titleElement);
        content.appendChild(messageElement);
        
        // Thanh tiến trình
        const progress = document.createElement('div');
        progress.className = 'notification-progress';
        const progressBar = document.createElement('div');
        progressBar.className = 'notification-progress-bar';
        progress.appendChild(progressBar);
        
        // Ghép các phần lại
        notification.appendChild(icon);
        notification.appendChild(content);
        notification.appendChild(progress);
        
        // Thêm vào body
        document.body.appendChild(notification);
        
        // Xóa thông báo sau 3 giây
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }, 3000);

        return notification;
    }

    // Xử lý đăng nhập
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitButton = form.querySelector('.auth-button');

            // Kiểm tra dữ liệu
            if (!email || !password) {
                showNotification('Lỗi Đăng Nhập', 'Vui lòng điền đầy đủ thông tin!', 'error');
                return;
            }

            // Thêm trạng thái loading
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            try {
                // Lấy danh sách users
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);

                if (!user) {
                    showNotification('Lỗi Đăng Nhập', 'Email hoặc mật khẩu không chính xác!', 'error');
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Đăng Nhập';
                    return;
                }

                // Lưu thông tin nếu chọn "Nhớ mật khẩu"
                if (rememberMe && rememberMe.checked) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberedPassword');
                }

                // Lưu thông tin người dùng vào localStorage hoặc sessionStorage
                if (rememberMe) {
                    localStorage.setItem('loginUser', JSON.stringify(user));
                } else {
                    sessionStorage.setItem('loginUser', JSON.stringify(user));
                }

                showNotification(
                    'Đăng Nhập Thành Công',
                    'Chào mừng bạn đến với SmartBook!',
                    'success'
                );

                // Chuyển hướng dựa vào role
                setTimeout(() => {
                    if (user.role === 'admin' || user.role === 'staff') {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'customer-dashboard.html';
                    }
                }, 1000);

            } catch (error) {
                console.error('Lỗi:', error);
                submitButton.disabled = false;
                submitButton.innerHTML = 'Đăng Nhập';
                showNotification(
                    'Lỗi Hệ Thống',
                    'Có lỗi xảy ra. Vui lòng thử lại sau!',
                    'error'
                );
            }
        });
    }

    // Kiểm tra trạng thái đăng nhập
    const loginUser = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser') || 'null');
    if (loginUser) {
        window.location.href = loginUser.role === 'admin' || loginUser.role === 'staff' ? 'admin/dashboard.html' : 'index.html';
    }
}); 