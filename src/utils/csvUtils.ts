import { Category, Product, CSVImportResult } from '@/types/grocery';
import { CAT_OTHER_ID } from '@/data/seedData';

// Export categories to CSV
export const exportCategoriesToCSV = (categories: Category[]): string => {
  const headers = 'id,name,sortOrder';
  const rows = categories.map(c => `${c.id},${c.name},${c.sortOrder}`);
  return [headers, ...rows].join('\n');
};

// Export products to CSV
export const exportProductsToCSV = (products: Product[], suppliers: { id: string; name: string }[] = []): string => {
  const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));
  const headers = 'id,categoryId,displayName,supplierRef,imageKey,supplierId,supplierName';
  const rows = products.map(p => `${p.id},${p.categoryId},${p.displayName},${p.supplierRef},${p.imageKey},${p.supplierId || ''},${supplierMap.get(p.supplierId || '') || ''}`);
  return [headers, ...rows].join('\n');
};

// Parse categories CSV
export const parseCategoriesCSV = (csv: string): CSVImportResult => {
  const lines = csv.trim().split('\n');
  const result: CSVImportResult = {
    valid: 0,
    updated: 0,
    invalid: 0,
    invalidRows: [],
    data: [],
  };

  if (lines.length === 0) {
    return result;
  }

  // Check headers
  const csvHeaders = lines[0].split(',').map(h => h.trim().toLowerCase());
  const expectedHeaders = ['id', 'name', 'sortorder'];
  
  const headersMatch = expectedHeaders.every(h => csvHeaders.includes(h));
  if (!headersMatch) {
    result.invalidRows.push({
      row: 1,
      reason: 'En-têtes invalides. Attendu: id,name,sortOrder',
      data: lines[0],
    });
    result.invalid = 1;
    return result;
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim());
    
    if (values.length !== 3) {
      result.invalidRows.push({
        row: i + 1,
        reason: `Nombre de colonnes incorrect (${values.length} au lieu de 3)`,
        data: line,
      });
      result.invalid++;
      continue;
    }

    const [id, name, sortOrderStr] = values;
    const sortOrder = parseInt(sortOrderStr, 10);

    if (!id || !name || isNaN(sortOrder)) {
      result.invalidRows.push({
        row: i + 1,
        reason: 'Données invalides (id, name ou sortOrder manquant)',
        data: line,
      });
      result.invalid++;
      continue;
    }

    (result.data as Category[]).push({ id, name, sortOrder });
    result.valid++;
  }

  return result;
};

// Parse products CSV
export const parseProductsCSV = (csv: string, validCategoryIds: Set<string>): CSVImportResult => {
  const lines = csv.trim().split('\n');
  const result: CSVImportResult = {
    valid: 0,
    updated: 0,
    invalid: 0,
    invalidRows: [],
    data: [],
  };

  if (lines.length === 0) {
    return result;
  }

  // Check headers - support both old (5 col) and new (7 col) formats
  const csvHeaders = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['id', 'categoryid', 'displayname', 'supplierref', 'imagekey'];
  
  const headersMatch = requiredHeaders.every(h => csvHeaders.includes(h));
  if (!headersMatch) {
    result.invalidRows.push({
      row: 1,
      reason: 'En-têtes invalides. Attendu: id,categoryId,displayName,supplierRef,imageKey[,supplierId,supplierName]',
      data: lines[0],
    });
    result.invalid = 1;
    return result;
  }

  const hasSupplier = csvHeaders.includes('supplierid');

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim());
    
    if (values.length < 5) {
      result.invalidRows.push({
        row: i + 1,
        reason: `Nombre de colonnes incorrect (${values.length}, minimum 5)`,
        data: line,
      });
      result.invalid++;
      continue;
    }

    const [id, categoryId, displayName, supplierRef, imageKey] = values;
    const supplierId = hasSupplier && values.length > 5 ? values[5] : undefined;

    if (!id || !displayName || !supplierRef || !imageKey) {
      result.invalidRows.push({
        row: i + 1,
        reason: 'Données invalides (champ manquant)',
        data: line,
      });
      result.invalid++;
      continue;
    }

    // If categoryId is invalid, it will be remapped to cat_other
    const finalCategoryId = validCategoryIds.has(categoryId) ? categoryId : CAT_OTHER_ID;

    const product: Product = { id, categoryId: finalCategoryId, displayName, supplierRef, imageKey };
    if (supplierId) product.supplierId = supplierId;
    
    (result.data as Product[]).push(product);
    result.valid++;
  }

  return result;
};

// Download helper
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
