
'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCollection } from '@/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Download, AlertCircle } from 'lucide-react';

interface Report {
    id: string;
    name: string;
    pdfUrl?: string;
    status: 'generating' | 'completed' | 'failed';
    createdAt: { toDate: () => Date };
    createdBy: string;
}

export function ReportsList() {
    const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);

    const { data: reports, loading } = useCollection<Report>(
        currentWorkspaceId ? `workspaces/${currentWorkspaceId}/reports` : '',
        { orderBy: ['createdAt', 'desc'] }
    );

     if (!currentWorkspaceId) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Past Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please select a workspace to see past reports.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Past Reports</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Report Name</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Loading reports...</TableCell>
                            </TableRow>
                        ) : reports.length > 0 ? (
                            reports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.name}</TableCell>
                                    <TableCell>{report.createdAt.toDate().toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={report.status === 'completed' ? 'default' : report.status === 'failed' ? 'destructive' : 'secondary'}>
                                            {report.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {report.status === 'completed' && report.pdfUrl ? (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4"/>
                                                    Download
                                                </a>
                                            </Button>
                                        ) : report.status === 'failed' ? (
                                            <span className="text-sm text-destructive flex items-center justify-end gap-2">
                                                <AlertCircle className="h-4 w-4"/>
                                                Generation Failed
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Processing...</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No reports found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
    )
}
