import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";

interface FileUploadProps {
  onFileLoad: (numbers: string[]) => void;
}

export const FileUpload = ({ onFileLoad }: FileUploadProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo CSV.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    processCSV(file);
  };

  const processCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const numbers: string[] = [];

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine && index > 0) { // Skip header
          const columns = trimmedLine.split(',');
          const number = columns[0]?.trim();
          if (number) {
            numbers.push(number);
          }
        }
      });

      if (numbers.length === 0) {
        toast({
          title: "Arquivo vazio",
          description: "Nenhum número encontrado no arquivo CSV.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Arquivo carregado",
        description: `${numbers.length} números importados com sucesso.`,
      });

      onFileLoad(numbers);
    };

    reader.onerror = () => {
      toast({
        title: "Erro na leitura",
        description: "Erro ao ler o arquivo CSV.",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 transition-all duration-300 hover:shadow-lg">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Importar Números</h3>
          <p className="text-muted-foreground text-sm">
            Faça upload de um arquivo CSV com números no formato E164
          </p>
        </div>

        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Arraste seu arquivo CSV aqui
            </p>
            <p className="text-muted-foreground mb-4">
              ou clique para selecionar
            </p>
            <Button variant="outline">
              Selecionar Arquivo
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </Card>
  );
};