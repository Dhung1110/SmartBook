document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgotPasswordForm');
    const otpSection = document.getElementById('otpSection');
    const newPasswordSection = document.getElementById('newPasswordSection');
    const confirmNewPasswordSection = document.getElementById('confirmNewPasswordSection');
    const otpTimer = document.getElementById('otpTimer');
    const resendOtpButton = document.getElementById('resendOtp');
    const passwordToggles = document.querySelectorAll('.toggle-password');
    let otpTimerInterval;
    let generatedOtp = '';
    let currentPhone = '';
    let currentStep = 'phone'; // phone -> otp -> newPassword

    // Xử lý hiện/ẩn mật khẩu
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    });

    // Hàm tạo OTP
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Hàm bắt đầu đếm ngược OTP
    function startOtpTimer() {
        let timeLeft = 300; // 5 phút
        otpTimer.textContent = '05:00';
        resendOtpButton.disabled = true;

        clearInterval(otpTimerInterval);
        otpTimerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            otpTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(otpTimerInterval);
                resendOtpButton.disabled = false;
                generatedOtp = ''; // Hủy OTP cũ
            }
        }, 1000);
    }

    // Hàm gửi OTP
    function sendOTP(phone) {
        generatedOtp = generateOTP();
        // Hiển thị OTP trong môi trường development
        console.log('%c[DEV MODE] Mã OTP của bạn là: ' + generatedOtp, 'background: #222; color: #bada55; font-size: 16px; padding: 10px;');
        
        // Thêm thông báo để hướng dẫn người dùng trong môi trường development
        showNotification(
            'Chế độ test', 
            'Mở Console (F12) để xem mã OTP', 
            'info'
        );
        
        // Thông báo gửi OTP
        setTimeout(() => {
            showNotification(
                'Gửi OTP thành công', 
                `Mã xác thực đã được gửi đến số điện thoại ${phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3')}`, 
                'success'
            );
        }, 1000);
        
        startOtpTimer();
    }

    // Hàm hiển thị thông báo
    function showNotification(title, message, type = 'success') {
        const existingNotification = document.querySelector('.notification-popup');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification-popup ${type}`;
        
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        
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
        
        const progress = document.createElement('div');
        progress.className = 'notification-progress';
        const progressBar = document.createElement('div');
        progressBar.className = 'notification-progress-bar';
        progress.appendChild(progressBar);
        
        notification.appendChild(icon);
        notification.appendChild(content);
        notification.appendChild(progress);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Xử lý sự kiện gửi lại OTP
    resendOtpButton.addEventListener('click', function() {
        sendOTP(currentPhone);
    });

    // Xử lý form
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('.auth-button');

            switch (currentStep) {
                case 'phone':
                    const phone = document.getElementById('phone').value.trim();
                    
                    // Kiểm tra số điện thoại
                    if (!/^[0-9]{10}$/.test(phone)) {
                        showNotification('Lỗi', 'Số điện thoại không hợp lệ!', 'error');
                        return;
                    }

                    // Kiểm tra số điện thoại đã đăng ký
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const user = users.find(u => u.phone === phone);
                    
                    if (!user) {
                        showNotification('Lỗi', 'Số điện thoại chưa được đăng ký!', 'error');
                        return;
                    }

                    currentPhone = phone;
                    otpSection.style.display = 'block';
                    sendOTP(phone);
                    submitButton.textContent = 'Xác nhận OTP';
                    currentStep = 'otp';
                    break;

                case 'otp':
                    const otp = document.getElementById('otp').value;
                    
                    if (otp !== generatedOtp) {
                        showNotification('Lỗi', 'Mã OTP không chính xác!', 'error');
                        return;
                    }

                    newPasswordSection.style.display = 'block';
                    confirmNewPasswordSection.style.display = 'block';
                    submitButton.textContent = 'Đổi mật khẩu';
                    currentStep = 'newPassword';
                    break;

                case 'newPassword':
                    const newPassword = document.getElementById('newPassword').value;
                    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

                    if (newPassword.length < 6) {
                        showNotification('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                        return;
                    }

                    if (newPassword !== confirmNewPassword) {
                        showNotification('Lỗi', 'Mật khẩu xác nhận không khớp!', 'error');
                        return;
                    }

                    // Cập nhật mật khẩu mới
                    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
                    const userIndex = allUsers.findIndex(u => u.phone === currentPhone);
                    
                    if (userIndex !== -1) {
                        allUsers[userIndex].password = newPassword;
                        localStorage.setItem('users', JSON.stringify(allUsers));

                        // Hiệu ứng thành công
                        submitButton.classList.add('success');
                        submitButton.innerHTML = '<i class="fas fa-check"></i> Đổi mật khẩu thành công!';

                        showNotification(
                            'Thành công!',
                            'Mật khẩu đã được thay đổi. Đang chuyển hướng...',
                            'success'
                        );

                        // Chuyển hướng sau 2 giây
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    }
                    break;
            }
        });
    }
}); 