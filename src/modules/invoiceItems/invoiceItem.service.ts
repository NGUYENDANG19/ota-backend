import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateInvoiceItemDto } from "./dto/createInvoiceItem.dto";
import { UpdateInvoiceItemDto } from "./dto/updateInvoiceItem.dto";
import { InvoiceItemEntity } from "src/entities/invoiceItems.entity";
import { InvoiceItem } from "src/models/invoiceItem.model";
import { ServiceService } from "../services/service.service";
import { CreateInvoiceItemsDto } from "./dto/createInvoiceItems.dto";

@Injectable()
export class InvoiceItemService {
    constructor(
        @InjectRepository(InvoiceItemEntity)
        private readonly invoiceItemRepository: Repository<InvoiceItemEntity>,
        private readonly serviceService: ServiceService
    ) { }

    async getInvoiceItems(): Promise<InvoiceItem[]> {
        const invoiceItems = await this.invoiceItemRepository.find();
        return invoiceItems.map(invoiceItem => new InvoiceItem(invoiceItem.id, invoiceItem.service_id, invoiceItem.item_name, invoiceItem.quantity, invoiceItem.unit_price, invoiceItem.total_price, invoiceItem.invoice_id));
    }

    async findOneInvoiceItem(id: number): Promise<InvoiceItem> {
        const invoiceItem = await this.invoiceItemRepository.findOne({ where: { id } });
        return new InvoiceItem(invoiceItem.id, invoiceItem.service_id, invoiceItem.item_name, invoiceItem.quantity, invoiceItem.unit_price, invoiceItem.total_price, invoiceItem.invoice_id);
    }

    async createInvoiceItem(createInvoiceItemDto: CreateInvoiceItemDto): Promise<InvoiceItem> {
        const invoiceItem = new InvoiceItem();
        invoiceItem.service_id = createInvoiceItemDto.service_id;
        invoiceItem.item_name = createInvoiceItemDto.item_name;
        invoiceItem.quantity = createInvoiceItemDto.quantity;
        invoiceItem.unit_price = createInvoiceItemDto.unit_price;
        invoiceItem.total_price = createInvoiceItemDto.total_price;
        invoiceItem.invoice_id = createInvoiceItemDto.invoice_id;

        await this.invoiceItemRepository.save(invoiceItem);
        return new InvoiceItem(invoiceItem.id, invoiceItem.service_id, invoiceItem.item_name, invoiceItem.quantity, invoiceItem.unit_price, invoiceItem.total_price, invoiceItem.invoice_id);

    }

    async updateInvoiceItem(updateInvoiceItemDto: UpdateInvoiceItemDto): Promise<InvoiceItem> {
        const { id, quantity, unit_price, ...updateInvoiceItemData } = updateInvoiceItemDto;

        // Tìm đối tượng invoiceItem từ cơ sở dữ liệu
        const invoiceItem = await this.invoiceItemRepository.findOne({ where: { id } });

        if (!invoiceItem) {
            throw new Error('Invoice item not found');
        }

        // Cập nhật các thuộc tính của invoiceItem với dữ liệu từ DTO
        Object.assign(invoiceItem, updateInvoiceItemData);

        // Cập nhật quantity và unit_price nếu có thay đổi
        if (quantity !== undefined) {
            invoiceItem.quantity = quantity;
        }
        if (unit_price !== undefined) {
            invoiceItem.unit_price = unit_price;
        }

        // Gọi phương thức tính toán lại tổng giá trị (total_price)
        invoiceItem.calculateTotalPrice();  // Tính lại total_price trước khi lưu

        // Lưu đối tượng vào cơ sở dữ liệu, gọi @BeforeUpdate hook nếu có thay đổi
        await this.invoiceItemRepository.save(invoiceItem);

        // Trả về đối tượng invoiceItem đã cập nhật
        return new InvoiceItem(
            invoiceItem.id,
            invoiceItem.service_id,
            invoiceItem.item_name,
            invoiceItem.quantity,
            invoiceItem.unit_price,
            invoiceItem.total_price,
            invoiceItem.invoice_id
        );
    }

    async deleteInvoiceItem(id: number): Promise<string> {
        await this.invoiceItemRepository.delete(id);
        return `Delete invoiceItem ${id} success`;
    }

    async createInvoiceItems(createInvoiceItemsDto: CreateInvoiceItemsDto[], invoice_id: number): Promise<string> {
        createInvoiceItemsDto.map(async dto => {
            const service = await this.serviceService.findOneService(dto.id);
            const invoiceItem = new InvoiceItem();
            invoiceItem.service_id = service ? dto.id : null;
            invoiceItem.item_name = dto.name;
            invoiceItem.quantity = dto.quantity;
            invoiceItem.unit_price = dto.unit_price;
            invoiceItem.total_price = dto.quantity * dto.unit_price;
            invoiceItem.invoice_id = invoice_id;

            await this.invoiceItemRepository.save(invoiceItem);
        });

        return 'Created success';
    }

    async getInvoiceItemsById(invoice_id: number): Promise<InvoiceItem[]> {
        const invoiceItems = this.invoiceItemRepository.find({
            where: { invoice_id },
            relations: ['service']
        });

        return invoiceItems;
    }

}