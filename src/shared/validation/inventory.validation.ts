import { rules, type ValidationSchema } from '../utils/validation';
import type { SupplierFormValues } from '../types/inventoryMaster.types';
import type { ProductFormValues, StockMovementFormValues } from '../types/inventoryProduct.types';
import type { StockAdjustmentFormValues } from '../types/inventoryStock.types';

export const getSupplierValidationSchema = (options: {
  requireCode: boolean;
}): ValidationSchema<SupplierFormValues> => {
  const schema: ValidationSchema<SupplierFormValues> = {
    supplierName: [
      rules.required('Supplier name is required'),
      rules.minLength(2, 'Supplier name must be at least 2 characters'),
      rules.maxLength(120, 'Supplier name cannot exceed 120 characters'),
    ],
    email: [rules.email()],
    mobile: [rules.indianMobile()],
    alternateMobile: [
      rules.indianMobile('Enter a valid 10-digit alternate mobile number'),
    ],
    gstNumber: [rules.indianGst()],
    panNumber: [rules.indianPan()],
    pincode: [rules.indianPincode()],
    website: [rules.optionalUrl()],
    contactPerson: [rules.maxLength(80, 'Contact person cannot exceed 80 characters')],
  };

  if (options.requireCode) {
    schema.supplierCode = [
      rules.required('Supplier code is required'),
      rules.alphanumericCode(),
    ];
  }

  return schema;
};

export const getProductValidationSchema = (options: {
  requireCode: boolean;
}): ValidationSchema<ProductFormValues> => {
  const schema: ValidationSchema<ProductFormValues> = {
    productName: [
      rules.required('Product name is required'),
      rules.minLength(2, 'Product name must be at least 2 characters'),
      rules.maxLength(160, 'Product name cannot exceed 160 characters'),
    ],
    categoryId: [rules.required('Category is required')],
    unitId: [rules.required('Unit is required')],
    purchasePrice: [rules.nonNegativeNumber()],
    salePrice: [rules.nonNegativeNumber()],
    minStock: [rules.nonNegativeNumber()],
    maxStock: [rules.nonNegativeNumber()],
    barcode: [rules.maxLength(64, 'Barcode cannot exceed 64 characters')],
    description: [rules.maxLength(500, 'Description cannot exceed 500 characters')],
  };

  if (options.requireCode) {
    schema.productCode = [
      rules.required('Product code is required'),
      rules.alphanumericCode(),
    ];
  }

  return schema;
};

export const getStockMovementValidationSchema = (options: {
  requireDocumentNo: boolean;
}): ValidationSchema<StockMovementFormValues> => {
  const schema: ValidationSchema<StockMovementFormValues> = {
    movementDate: [rules.required('Date is required')],
    warehouseId: [rules.required('Warehouse is required')],
    referenceNo: [rules.maxLength(80, 'Reference number cannot exceed 80 characters')],
    notes: [rules.maxLength(500, 'Notes cannot exceed 500 characters')],
  };

  if (options.requireDocumentNo) {
    schema.documentNo = [
      rules.required('Document number is required'),
      rules.alphanumericCode(),
    ];
  }

  return schema;
};

export const validateStockMovementLines = (
  lines: StockMovementFormValues['lines']
): string | undefined => {
  const validLines = lines.filter((line) => line.productId && line.quantity.trim());
  if (validLines.length === 0) {
    return 'Add at least one product line with quantity.';
  }

  for (const line of validLines) {
    const qty = Number.parseFloat(line.quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      return 'Each line quantity must be greater than 0.';
    }
    if (line.unitCost.trim()) {
      const cost = Number.parseFloat(line.unitCost);
      if (Number.isNaN(cost) || cost < 0) {
        return 'Unit cost must be 0 or greater.';
      }
    }
  }

  return undefined;
};

export const getStockAdjustmentValidationSchema = (options: {
  requireNumber: boolean;
}): ValidationSchema<StockAdjustmentFormValues> => {
  const schema: ValidationSchema<StockAdjustmentFormValues> = {
    adjustmentDate: [rules.required('Date is required')],
    warehouseId: [rules.required('Warehouse is required')],
    reason: [rules.required('Reason is required')],
    notes: [rules.maxLength(500, 'Notes cannot exceed 500 characters')],
  };

  if (options.requireNumber) {
    schema.adjustmentNumber = [
      rules.required('Document number is required'),
      rules.alphanumericCode(),
    ];
  }

  return schema;
};

export const validateStockAdjustmentLines = (
  lines: StockAdjustmentFormValues['lines']
): string | undefined => {
  const validLines = lines.filter((line) => line.productId && line.physicalQty.trim() !== '');
  if (validLines.length === 0) {
    return 'Add at least one product line with physical quantity.';
  }

  for (const line of validLines) {
    const qty = Number.parseFloat(line.physicalQty);
    if (Number.isNaN(qty) || qty < 0) {
      return 'Physical quantity must be 0 or greater.';
    }
  }

  return undefined;
};
