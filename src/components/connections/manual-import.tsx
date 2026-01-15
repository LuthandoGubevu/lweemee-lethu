
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// In a real app, this would be fetched or stored more robustly.
const CSV_TEMPLATE_URL = '/templates/lweemee_manual_import_template.csv';

interface ImportHistory {
    id: string;
    fileName: string;
    status: 'processing' | 'success' | 'failed';
    createdAt: { toDate: () => Date };
    userEmail: string;
    errorMessage?: string;
}

export function ManualImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [currentWorkspaceId] = useLocalStorage('currentWorkspaceId', null);
  const firestore = useFirestore();
  const { user } = useUser();

  const { data: importHistory, loading: historyLoading } = useCollection<ImportHistory>(
      currentWorkspaceId ? `workspaces/${currentWorkspaceId}/imports` : ''
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }
    if (!currentWorkspaceId || !firestore || !user) {
        toast({ title: 'Cannot upload file', description: 'User or workspace not found.', variant: 'destructive'});
        return;
    }

    setIsUploading(true);
    try {
        const storage = getStorage();
        const timestamp = new Date().getTime();
        const storagePath = `imports/${currentWorkspaceId}/${user.uid}/${timestamp}-${file.name}`;
        const storageRef = ref(storage, storagePath);

        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file);

        // Create a record in Firestore to trigger the (hypothetical) Cloud Function
        const importsRef = collection(firestore, `workspaces/${currentWorkspaceId}/imports`);
        await addDoc(importsRef, {
            fileName: file.name,
            storagePath: storagePath,
            status: 'processing',
            createdAt: serverTimestamp(),
            userId: user.uid,
            userEmail: user.email,
        });

      toast({ title: 'Upload successful', description: 'Your file is being processed.' });
      setFile(null);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import from CSV</CardTitle>
          <CardDescription>
            Upload historical data using our CSV template. This will populate
            your metrics and post performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <a href={CSV_TEMPLATE_URL} download>
              <Button variant="outline" className="w-full">
                <Download className="mr-2" />
                Download Template
              </Button>
            </a>
            <div className="flex-1 space-y-2">
                 <Input type="file" accept=".csv" onChange={handleFileChange} />
                 <Button onClick={handleUpload} disabled={isUploading || !file} className="w-full">
                    {isUploading ? 'Uploading...' : 'Upload File'} <Upload className="ml-2"/>
                 </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
          <CardHeader>
              <CardTitle>Import History</CardTitle>
          </CardHeader>
          <CardContent>
               <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {historyLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Loading history...</TableCell>
                            </TableRow>
                        ) : importHistory.length > 0 ? (
                           importHistory.map(item => (
                               <TableRow key={item.id}>
                                   <TableCell>{item.fileName}</TableCell>
                                   <TableCell>{item.userEmail}</TableCell>
                                   <TableCell>{item.createdAt.toDate().toLocaleString()}</TableCell>
                                   <TableCell>
                                       <Badge variant={item.status === 'success' ? 'default' : item.status === 'failed' ? 'destructive' : 'secondary'} className="capitalize">
                                           {item.status}
                                       </Badge>
                                       {item.status === 'failed' && <p className="text-xs text-destructive mt-1">{item.errorMessage}</p>}
                                   </TableCell>
                               </TableRow>
                           ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No import history found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
               </Table>
          </CardContent>
      </Card>
    </div>
  );
}

