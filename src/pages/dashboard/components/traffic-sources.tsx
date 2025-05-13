import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type TrafficSource = {
    name: string;
    percentage: number;
}

const trafficSources: TrafficSource[] = [
    { name: 'Google', percentage: 40 },
    { name: 'YouTube', percentage: 25 },
    { name: 'Instagram', percentage: 75 },
    { name: 'Pinterest', percentage: 30 },
    { name: 'Facebook', percentage: 45 },
    { name: 'Twitter', percentage: 20 },
    { name: 'Tumblr', percentage: 15 },
]

export function TrafficSources() {
    return (
        <Card className="col-span-1 lg:col-span-3 border-none shadow-sm dark:bg-gray-900/40">
            <CardHeader className="pb-1 pt-5">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Traffic by Website</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="space-y-4">
                    {trafficSources.map((source) => (
                        <div key={source.name} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{source.name}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    className={`h-1.5 rounded-full ${source.name === 'Instagram'
                                            ? 'bg-gray-800 dark:bg-gray-300'
                                            : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
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