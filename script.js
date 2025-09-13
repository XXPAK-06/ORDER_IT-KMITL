// จัดการข้อมูลผู้ใช้ใน localStorage
const UserStorage = {
    saveUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    },

    getUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    },

    clearUser() {
        localStorage.removeItem('currentUser');
    }
};

// โหลดข้อมูลผู้ใช้เมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', async () => {
    const savedUser = UserStorage.getUser();
    if (savedUser) {
        // ดึงข้อมูลล่าสุดจาก server
        try {
            const response = await fetch(`/user/${savedUser.student_id}`);
            const userData = await response.json();
            if (userData) {
                // อัพเดทฟอร์มด้วยข้อมูลผู้ใช้
                document.getElementById('customerName').value = userData.name || '';
                document.getElementById('phoneNumber').value = userData.phone || '';
                // แสดงประวัติการจอง
                loadBookingHistory(userData.student_id);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
});

// โหลดประวัติการจอง
async function loadBookingHistory(studentId) {
    try {
        const response = await fetch(`/history/${studentId}`);
        const bookings = await response.json();
        displayBookingHistory(bookings);
    } catch (error) {
        console.error('Error loading booking history:', error);
    }
}

// แสดงประวัติการจอง
function displayBookingHistory(bookings) {
    const historyContainer = document.getElementById('bookingHistory');
    if (!historyContainer) return;

    historyContainer.innerHTML = bookings.map(booking => `
        <div class="booking-history-item">
            <p>วันที่: ${new Date(booking.slot_time).toLocaleDateString('th-TH')}</p>
            <p>เวลา: ${new Date(booking.slot_time).toLocaleTimeString('th-TH')}</p>
            <p>สถานะ: ${getBookingStatus(booking)}</p>
        </div>
    `).join('');
}

// แสดงสถานะการจอง
function getBookingStatus(booking) {
    if (booking.checkout_time) return 'เสร็จสิ้น';
    if (booking.checkin_time) return 'กำลังใช้งาน';
    return 'รอการเช็คอิน';
}
