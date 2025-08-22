import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { StatsCard } from '@/components/StatsCard';
import { ValidationTable, ValidationResult } from '@/components/ValidationTable';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Phone, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import { isValidE164, simulateWhatsAppValidation } from '@/utils/phoneValidation';

const Index = () => {
  const { toast } = useToast();
  const [numbers, setNumbers] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);

  const handleFileLoad = (loadedNumbers: string[]) => {
    setNumbers(loadedNumbers);
    
    // Initialize validation results
    const initialResults: ValidationResult[] = loadedNumbers.map(number => ({
      number,
      isValidE164: isValidE164(number),
      hasWhatsApp: null,
      status: 'pending'
    }));
    
    setValidationResults(initialResults);
    setValidationProgress(0);
  };

  const startValidation = async () => {
    if (numbers.length === 0) {
      toast({
        title: "Nenhum número carregado",
        description: "Por favor, importe um arquivo CSV primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    setValidationProgress(0);

    const updatedResults = [...validationResults];

    for (let i = 0; i < updatedResults.length; i++) {
      const result = updatedResults[i];
      
      // Update status to validating
      result.status = 'validating';
      setValidationResults([...updatedResults]);

      // Only validate WhatsApp for valid E164 numbers
      if (result.isValidE164) {
        try {
          const hasWhatsApp = await simulateWhatsAppValidation(result.number);
          result.hasWhatsApp = hasWhatsApp;
        } catch (error) {
          result.hasWhatsApp = false;
        }
      } else {
        result.hasWhatsApp = false;
      }

      result.status = 'completed';
      
      // Update progress
      const progress = ((i + 1) / updatedResults.length) * 100;
      setValidationProgress(progress);
      setValidationResults([...updatedResults]);
    }

    setIsValidating(false);
    
    toast({
      title: "Validação concluída",
      description: `${updatedResults.length} números validados com sucesso.`,
    });
  };

  const exportResults = () => {
    if (validationResults.length === 0) {
      toast({
        title: "Nenhum resultado",
        description: "Execute a validação primeiro.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      'Número,Formato E164,WhatsApp Ativo,Status',
      ...validationResults.map(result => 
        `${result.number},${result.isValidE164 ? 'Sim' : 'Não'},${result.hasWhatsApp ? 'Sim' : 'Não'},${result.status === 'completed' ? 'Concluído' : 'Pendente'}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultados-validacao-whatsapp.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Arquivo exportado",
      description: "Resultados salvos em CSV com sucesso.",
    });
  };

  // Calculate stats
  const totalNumbers = validationResults.length;
  const validE164 = validationResults.filter(r => r.isValidE164).length;
  const withWhatsApp = validationResults.filter(r => r.hasWhatsApp === true).length;
  const completed = validationResults.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 mr-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              WhatsApp Checker
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Importe e valide números de telefone no formato E164 para verificar se possuem WhatsApp ativo
          </p>
        </div>

        {/* File Upload */}
        <div className="max-w-2xl mx-auto mb-8">
          <FileUpload onFileLoad={handleFileLoad} />
        </div>

        {/* Stats Cards */}
        {totalNumbers > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total de Números"
              value={totalNumbers}
              icon={FileText}
              color="primary"
            />
            <StatsCard
              title="Formato E164 Válido"
              value={validE164}
              icon={CheckCircle}
              color="success"
            />
            <StatsCard
              title="Com WhatsApp"
              value={withWhatsApp}
              icon={Phone}
              color="success"
            />
            <StatsCard
              title="Validados"
              value={completed}
              icon={CheckCircle}
              color="primary"
            />
          </div>
        )}

        {/* Validation Controls */}
        {totalNumbers > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={startValidation}
              disabled={isValidating}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="lg"
            >
              {isValidating ? 'Validando...' : 'Iniciar Validação'}
            </Button>
            <Button
              onClick={exportResults}
              variant="outline"
              size="lg"
              disabled={completed === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Resultados
            </Button>
          </div>
        )}

        {/* Validation Progress */}
        {isValidating && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-card p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso da Validação</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(validationProgress)}%
                </span>
              </div>
              <Progress value={validationProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                Validando {completed} de {totalNumbers} números...
              </p>
            </div>
          </div>
        )}

        {/* Results Table */}
        <ValidationTable results={validationResults} />
      </div>
    </div>
  );
};

export default Index;