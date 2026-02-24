document.addEventListener('DOMContentLoaded', function() {
    // Lấy form và các elements
    const form = document.getElementById('registerForm');
    const passwordToggles = document.querySelectorAll('.toggle-password');
    const otpSection = document.getElementById('otpSection');
    const otpTimer = document.getElementById('otpTimer');
    const resendOtpButton = document.getElementById('resendOtp');
    let otpTimerInterval;
    let generatedOtp = '';

    // Thêm thông báo xử lý
    const processingMessage = document.createElement('div');
    processingMessage.className = 'processing-message';
    processingMessage.innerHTML = 'Đang xử lý đăng ký...';
    form.appendChild(processingMessage);

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

    // Xử lý sự kiện gửi lại OTP
    resendOtpButton.addEventListener('click', function() {
        const phone = document.getElementById('phone').value;
        sendOTP(phone);
    });

    // Tạo mã giảm giá ngẫu nhiên
    function generateDiscountCode() {
        const prefix = 'NEW';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = prefix;
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    // Lưu mã giảm giá cho người dùng
    function saveDiscountCode(userId) {
        const discountCode = generateDiscountCode();
        const userDiscounts = JSON.parse(localStorage.getItem('userDiscounts') || '{}');
        
        userDiscounts[userId] = {
            code: discountCode,
            value: 50000, // Giảm 50,000đ
            minOrder: 100000, // Đơn hàng tối thiểu 100,000đ
            used: false,
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Hết hạn sau 30 ngày
        };

        localStorage.setItem('userDiscounts', JSON.stringify(userDiscounts));
        return discountCode;
    }

    // Xử lý đăng ký
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitButton = this.querySelector('.auth-button');
            
            // Lấy giá trị từ form
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const otp = document.getElementById('otp')?.value;

            // Kiểm tra dữ liệu
            if (!fullName || !email || !phone || !password || !confirmPassword) {
                showNotification('Lỗi Đăng Ký', 'Vui lòng điền đầy đủ thông tin!', 'error');
                submitButton.classList.add('error');
                setTimeout(() => submitButton.classList.remove('error'), 500);
                return;
            }

            if (password.length < 6) {
                showNotification('Lỗi Đăng Ký', 'Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                submitButton.classList.add('error');
                setTimeout(() => submitButton.classList.remove('error'), 500);
                return;
            }

            if (!email.includes('@')) {
                showNotification('Lỗi Đăng Ký', 'Email không hợp lệ!', 'error');
                submitButton.classList.add('error');
                setTimeout(() => submitButton.classList.remove('error'), 500);
                return;
            }

            if (!/^[0-9]{10}$/.test(phone)) {
                showNotification('Lỗi Đăng Ký', 'Số điện thoại phải có 10 chữ số!', 'error');
                submitButton.classList.add('error');
                setTimeout(() => submitButton.classList.remove('error'), 500);
                return;
            }

            // Kiểm tra mật khẩu khớp nhau
            if (password !== confirmPassword) {
                showNotification('Lỗi', 'Mật khẩu xác nhận không khớp!', 'error');
                return;
            }

            // Nếu chưa hiển thị phần OTP
            if (otpSection.style.display === 'none') {
                // Kiểm tra số điện thoại hợp lệ trước khi gửi OTP
                if (!/^[0-9]{10}$/.test(phone)) {
                    showNotification('Lỗi Đăng Ký', 'Số điện thoại phải có 10 chữ số!', 'error');
                    return;
                }
                otpSection.style.display = 'block';
                sendOTP(phone);
                return;
            }

            // Kiểm tra OTP
            if (otp !== generatedOtp) {
                showNotification('Lỗi', 'Mã OTP không chính xác!', 'error');
                return;
            }

            // Thêm trạng thái loading
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            try {
                // Lấy danh sách users hiện có
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                // Kiểm tra email đã tồn tại
                if (users.some(user => user.email === email)) {
                    showNotification('Lỗi', 'Email này đã được đăng ký!', 'error');
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Đăng Ký';
                    return;
                }

                // Tạo user mới
                const newUser = {
                    id: Date.now().toString(),
                    fullName,
                    email,
                    phone,
                    password,
                    role: 'customer',
                    createdAt: new Date().toISOString()
                };

                // Thêm user mới vào danh sách
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));

                // Tạo mã giảm giá cho người dùng mới
                const discountCode = saveDiscountCode(newUser.id);

                // Hiệu ứng thành công
                submitButton.classList.add('success');
                submitButton.innerHTML = '<i class="fas fa-check"></i> Đăng ký thành công!';

                // Thông báo thành công với mã giảm giá
                showNotification(
                    'Đăng Ký Thành Công!',
                    `Chào mừng bạn đến với SmartBook! 
                    Bạn được tặng mã giảm giá ${discountCode} trị giá 50.000đ cho đơn hàng từ 100.000đ.
                    Mã có hiệu lực trong 30 ngày.`,
                    'success'
                );

                // Chuyển hướng sau 5 giây
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 5000);

            } catch (error) {
                console.error('Lỗi:', error);
                showNotification('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại!', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = 'Đăng Ký';
            }
        });
    }
}); 