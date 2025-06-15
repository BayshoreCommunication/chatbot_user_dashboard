import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTrafficSources } from '@/hooks/useTrafficSources'
import { LoadingSpinner } from '@/components/custom/loading-spinner'

export function TrafficSources() {
    const { sources, isLoading, error } = useTrafficSources();

    if (isLoading) {
        return (
            <Card className="col-span-1 lg:col-span-3 border-none shadow-sm dark:bg-gray-900/40">
                <CardHeader className="pb-1 pt-5">
                    <CardTitle className="text-sm font-medium dark:text-gray-300">Traffic by Website</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="flex items-center justify-center h-[200px]">
                        <LoadingSpinner size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="col-span-1 lg:col-span-3 border-none shadow-sm dark:bg-gray-900/40">
                <CardHeader className="pb-1 pt-5">
                    <CardTitle className="text-sm font-medium dark:text-gray-300">Traffic by Website</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="flex items-center justify-center h-[200px] text-red-500">
                        Error loading traffic sources
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 lg:col-span-3 border-none shadow-sm dark:bg-gray-900/40">
            <CardHeader className="pb-1 pt-5">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Traffic by Website</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="space-y-4">
                    {sources.map((source) => (
                        <div key={source.name} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{source.name}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{source.percentage}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    className="h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"
                                    style={{ width: `${source.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
} 