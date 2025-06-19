import { useOrganizationUsage } from '@/hooks/useOrganizationUsage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/custom/loading-spinner';

export function AnalyticsCards() {
    const { data: usageData, isLoading, isError } = useOrganizationUsage();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <LoadingSpinner size="sm" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Loading...</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError || !usageData) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">Failed to load data</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num);
    };

    const formatStorage = (bytes: number) => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(usageData.total_users)}</div>
                    <p className="text-xs text-muted-foreground">
                        Unique visitors
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{formatNumber(Math.floor(usageData.api_calls / 2))}</div>
                    <p className="text-xs text-muted-foreground">
                        Total conversations
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatStorage(usageData.storage_used)}</div>
                    <p className="text-xs text-muted-foreground">
                        Vector embeddings
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(usageData.documents)}</div>
                    <p className="text-xs text-muted-foreground">
                        Uploaded files
                    </p>
                </CardContent>
            </Card>
        </div>
    );
} 