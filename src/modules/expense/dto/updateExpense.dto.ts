import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";

export class UpdateExpenseDto {
    @IsNotEmpty({ message: 'id không được để trống' })
    id: number;

    @IsOptional()
    @IsNotEmpty({ message: 'amount không được để trống' })
    amount: number;

    @IsOptional()
    @IsEnum(['Cash', 'Credit_card', 'Bank_transfer'])
    @IsNotEmpty({ message: 'payment_method không được để trống' })
    payment_method: 'Cash' | 'Credit_card' | 'Bank_transfer';

    @IsOptional()
    @IsNotEmpty({ message: 'note không được để trống' })
    note: string;

    @IsOptional()
    @IsNotEmpty({ message: 'customer_name không được để trống' })
    customer_name?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'created_by không được để trống' })
    created_by?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'hotel_id không được để trống' })
    hotel_id?: number;

    @IsOptional()
    @IsNotEmpty({ message: 'category không được để trống' })
    category?: 'Room_Payment' | 'Service' | 'Other';

    @IsOptional()
    @IsNotEmpty({ message: 'invoice_id không được để trống' })
    invoice_id?: number;
}