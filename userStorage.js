const UserStorage = {
    saveUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    },

    getUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    },

    saveBooking(bookingData) {
        const bookings = this.getBookings();
        bookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));
    },

    getBookings() {
        return JSON.parse(localStorage.getItem('bookings') || '[]');
    },

    updateBookingStatus(bookingId, status) {
        const bookings = this.getBookings();
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = status;
            localStorage.setItem('bookings', JSON.stringify(bookings));
        }
    }
};
