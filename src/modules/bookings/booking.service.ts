import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Not } from 'typeorm';
import { BookingEntity } from 'src/entities/booking.entity';
import { CreateBookingDto } from './dto/createBooking.dto';
import { UpdateBookingDto } from './dto/updateBooking.dto';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
    ) { }

    // Lấy tất cả các booking
    async getBookings() {
        return this.bookingRepository.find();
    }

    // Lấy chi tiết booking theo ID
    async getBookingById(id: number) {
        const booking = await this.bookingRepository.findOne({
            where: { id }, // Cập nhật đoạn này
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        return booking;
    }

    // Tạo mới booking
    async createBooking(createBookingDto: CreateBookingDto) {
        const booking = this.bookingRepository.create(createBookingDto);
        await this.bookingRepository.save(booking);
        return booking;
    }

    // Cập nhật booking theo ID
    async updateBooking(id: number, updateBookingDto: UpdateBookingDto) {
        const booking = await this.getBookingById(id); // Kiểm tra xem booking có tồn tại không
        Object.assign(booking, updateBookingDto); // Cập nhật các trường mới
        await this.bookingRepository.save(booking); // Lưu thay đổi
        return 'Update success';
    }

    // Xóa booking theo ID
    async deleteBooking(id: number) {
        await this.bookingRepository.delete(id);
        return `Delete booking ${id} success`;
    }

    async getbookingRoomsWithCustomerByRoomId(room_id: number): Promise<any[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookings = this.bookingRepository.find({
            relations: ['booking_rooms', 'customer'],
            where: {
                booking_rooms: {
                    room_id: room_id,
                    booking: {
                        check_out_at: MoreThanOrEqual(today),
                        status: Not('Cancelled')
                    }
                }
            }
        });
        return (await bookings).map(booking => ({
            id: booking.id,
            booking_at: booking.booking_at,
            check_in_at: booking.check_in_at,
            check_out_at: booking.check_out_at,
            customer: {
                id: booking.customer.id,
                name: booking.customer.name,
            },
        }));
    }
}
