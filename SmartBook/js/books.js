// Dữ liệu sách dùng chung
window.books = [
    {
        id: 1,
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        price: 69000,
        originalPrice: 85000,
        discount: 20,
        image: "images/books/sach1.jpg",
        category: "Sách Triết Lý",
        categoryId: 1,
        publisher: "NXB Tổng Hợp",
        year: 2021,
        pages: 320,
        language: "Tiếng Việt",
        isbn: "978-604-59-4359-0",
        size: "14.5 x 20.5 cm",
        description: "Đắc Nhân Tâm là cuốn sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia. Đây là cuốn sách duy nhất về thể loại self-help liên tục đứng đầu danh mục sách bán chạy nhất (best-selling books) do báo The New York Times bình chọn suốt 10 năm liền."
    },
    {
        id: 2,
        title: "Nhà Giả Kim",
        author: "Paulo Coelho",
        price: 86000,
        originalPrice: 100000,
        discount: 14,
        image: "images/books/sach2.jpg",
        category: "Sách Triết Lý",
        categoryId: 1,
        publisher: "NXB Văn Học",
        year: 2020,
        pages: 228,
        language: "Tiếng Việt",
        isbn: "978-604-228-396-0",
        size: "13 x 20.5 cm",
        description: "Nhà Giả Kim là một cuốn tiểu thuyết được xuất bản lần đầu ở Brasil năm 1988, và là cuốn sách nổi tiếng nhất của nhà văn Paulo Coelho. Tác phẩm đã được dịch ra 67 ngôn ngữ và bán ra hơn 65 triệu bản, trở thành một trong những cuốn sách bán chạy nhất mọi thời đại."
    },
    {
        id: 3,
        title: "Java Programming",
        author: "Oracle Press",
        price: 250000,
        originalPrice: 300000,
        discount: 16,
        image: "images/books/sach3.jpg",
        category: "Sách Lập Trình",
        categoryId: 2,
        publisher: "McGraw-Hill Education",
        year: 2023,
        pages: 850,
        language: "Tiếng Anh",
        isbn: "978-126-046-372-2",
        size: "18 x 24 cm",
        description: "Cuốn sách Java Programming mang đến những kiến thức nền tảng và chuyên sâu về ngôn ngữ lập trình Java. Nội dung bao gồm cả Java cơ bản và nâng cao, hướng đối tượng, xử lý ngoại lệ, luồng và nhiều chủ đề khác giúp bạn trở thành lập trình viên Java chuyên nghiệp."
    },
    {
        id: 4,
        title: "C++",
        author: "Napoleon Hill",
        price: 108000,
        originalPrice: 120000,
        discount: 10,
        image: "images/books/sach4.jpg",
        category: "Sách Lập Trình",
        categoryId: 2,
        publisher: "NXB Thông Tin và Truyền Thông",
        year: 2022,
        pages: 420,
        language: "Tiếng Việt",
        isbn: "978-604-80-5580-5",
        size: "16 x 24 cm",
        description: "C++ là ngôn ngữ lập trình đa mẫu hình với các tính năng như lập trình thủ tục, lập trình hướng đối tượng, lập trình tổng quát. Cuốn sách này giới thiệu đầy đủ các khái niệm và kỹ thuật lập trình C++ hiện đại, giúp người đọc nắm vững cấu trúc ngôn ngữ và áp dụng vào thực tế."
    }
];

// Kiểm tra xem đã có dữ liệu sách trong localStorage chưa
function initBooks() {
    const storedBooks = localStorage.getItem('books');
    
    // Nếu chưa có dữ liệu sách trong localStorage, hoặc muốn đảm bảo cập nhật
    if (!storedBooks) {
        // Lưu dữ liệu sách vào localStorage
        localStorage.setItem('books', JSON.stringify(window.books));
    }
}

// Hàm đồng bộ dữ liệu sách vào localStorage
function syncBooksToLocalStorage() {
    localStorage.setItem('books', JSON.stringify(window.books));
}

// Hàm lấy thông tin sách theo ID
function getBookById(id) {
    const books = JSON.parse(localStorage.getItem('books') || '[]');
    return books.find(book => book.id == id) || null;
}

// Khởi tạo dữ liệu sách ngay khi script được tải
initBooks();

// Cũng đồng bộ khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    initBooks();
}); 