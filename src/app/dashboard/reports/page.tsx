
'use client';
import { ReportBuilder } from '@/components/reports/report-builder';
import { ReportsList } from '@/components/reports/reports-list';

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Reports</h1>
                <p className="text-muted-foreground">Generate new reports and view past exports.</p>
            </div>
            <ReportBuilder />
            <ReportsList />
        </div>
    )
}
