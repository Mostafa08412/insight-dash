import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedProduct {
  name: string;
  description: string;
  category: string;
  price: string;
  quantity: string;
  supplier: string;
  isValid: boolean;
  errors: string[];
}

export default function CSVImportModal({ isOpen, onClose }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'text/csv' || droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
      parseCSV(droppedFile);
    } else {
      toast.error('Please upload a CSV file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file must have a header row and at least one data row');
        setIsProcessing(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['name', 'price', 'quantity'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      const products: ParsedProduct[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const errors: string[] = [];

        const name = values[headers.indexOf('name')] || '';
        const description = values[headers.indexOf('description')] || '';
        const category = values[headers.indexOf('category')] || '';
        const price = values[headers.indexOf('price')] || '';
        const quantity = values[headers.indexOf('quantity')] || '';
        const supplier = values[headers.indexOf('supplier')] || '';

        if (!name) errors.push('Name is required');
        if (!price || isNaN(parseFloat(price))) errors.push('Invalid price');
        if (!quantity || isNaN(parseInt(quantity))) errors.push('Invalid quantity');

        return {
          name,
          description,
          category,
          price,
          quantity,
          supplier,
          isValid: errors.length === 0,
          errors,
        };
      });

      setParsedData(products);
      setIsProcessing(false);
    };

    reader.onerror = () => {
      toast.error('Failed to read CSV file');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    const validProducts = parsedData.filter(p => p.isValid);
    if (validProducts.length === 0) {
      toast.error('No valid products to import');
      return;
    }

    // Simulate import
    toast.success(`Successfully imported ${validProducts.length} products!`);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    onClose();
  };

  const downloadTemplate = () => {
    const template = 'name,description,category,price,quantity,supplier\nSample Product,Product description,Electronics,99.99,100,Sample Supplier';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedData.filter(p => p.isValid).length;
  const invalidCount = parsedData.filter(p => !p.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Import Products from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
            <div>
              <p className="font-medium text-foreground">Need a template?</p>
              <p className="text-sm text-muted-foreground">Download our CSV template to get started</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-card/80 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          {/* Upload Area */}
          {!file && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">Drop your CSV file here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">Supports .csv files up to 10MB</p>
            </div>
          )}

          {/* File Selected */}
          {file && !isProcessing && (
            <>
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB • {parsedData.length} rows found
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                  }}
                  className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Validation Summary */}
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">{validCount} Valid</span>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-300 mt-1">Ready to import</p>
                </div>
                {invalidCount > 0 && (
                  <div className="flex-1 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <span className="font-medium text-destructive">{invalidCount} Invalid</span>
                    </div>
                    <p className="text-sm text-destructive/80 mt-1">Will be skipped</p>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedData.slice(0, 10).map((product, index) => (
                      <tr key={index} className={!product.isValid ? 'bg-destructive/5' : ''}>
                        <td className="px-4 py-3">
                          {product.isValid ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground">{product.name || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{product.category || '-'}</td>
                        <td className="px-4 py-3 text-foreground">${product.price || '-'}</td>
                        <td className="px-4 py-3 text-foreground">{product.quantity || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="px-4 py-2 bg-secondary text-center text-sm text-muted-foreground">
                    And {parsedData.length - 10} more rows...
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={validCount === 0}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {validCount} Products
                </button>
              </div>
            </>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Processing CSV...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
