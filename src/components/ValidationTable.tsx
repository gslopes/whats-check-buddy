import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Phone } from "lucide-react";

export interface ValidationResult {
  number: string;
  isValidE164: boolean;
  hasWhatsApp: boolean | null;
  status: 'pending' | 'validating' | 'completed';
}

interface ValidationTableProps {
  results: ValidationResult[];
}

export const ValidationTable = ({ results }: ValidationTableProps) => {
  const getStatusIcon = (result: ValidationResult) => {
    if (result.status === 'pending') {
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
    if (result.status === 'validating') {
      return <Clock className="h-4 w-4 text-warning animate-pulse" />;
    }
    if (!result.isValidE164) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (result.hasWhatsApp === true) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    if (result.hasWhatsApp === false) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (result: ValidationResult) => {
    if (result.status === 'pending') {
      return <Badge variant="secondary">Pendente</Badge>;
    }
    if (result.status === 'validating') {
      return <Badge variant="outline" className="animate-pulse">Validando...</Badge>;
    }
    if (!result.isValidE164) {
      return <Badge variant="destructive">Formato Inválido</Badge>;
    }
    if (result.hasWhatsApp === true) {
      return <Badge className="bg-success hover:bg-success/80">WhatsApp Ativo</Badge>;
    }
    if (result.hasWhatsApp === false) {
      return <Badge variant="destructive">Sem WhatsApp</Badge>;
    }
    return <Badge variant="secondary">Pendente</Badge>;
  };

  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Phone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">Nenhum número para validar</p>
        <p className="text-muted-foreground">
          Importe um arquivo CSV para começar a validação
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Resultados da Validação</h3>
        <p className="text-muted-foreground">
          {results.length} números carregados
        </p>
      </div>
      <div className="max-h-96 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Formato E164</TableHead>
              <TableHead>Status WhatsApp</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">{result.number}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {result.isValidE164 ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span>{result.isValidE164 ? 'Válido' : 'Inválido'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result)}
                    <span>
                      {result.hasWhatsApp === true && 'Ativo'}
                      {result.hasWhatsApp === false && 'Inativo'}
                      {result.hasWhatsApp === null && result.status === 'validating' && 'Verificando...'}
                      {result.hasWhatsApp === null && result.status !== 'validating' && 'Pendente'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(result)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};