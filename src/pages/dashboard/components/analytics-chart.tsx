import { Card, CardContent } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { LoadingSpinner } from '@/components/custom/loading-spinner';

export function AnalyticsChart() {
    const { data, isLoading, error } = useAnalyticsData();

    if (isLoading) {
        return (
            <Card className="col-span-1 lg:col-span-7 border-none shadow-sm dark:bg-gray-900/40">
                <CardContent className="pt-6 px-6">
                    <div className="flex items-center justify-center h-[350px]">
                        <LoadingSpinner size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="col-span-1 lg:col-span-7 border-none shadow-sm dark:bg-gray-900/40">
                <CardContent className="pt-6 px-6">
                    <div className="flex items-center justify-center h-[350px] text-red-500">
                        Error loading analytics data
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 lg:col-span-7 border-none shadow-sm dark:bg-gray-900/40">
            <CardContent className="pt-6 px-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-1 text-sm font-medium">
                            <span className="text-black dark:text-white border-b-2 border-black dark:border-white pb-1">Total Chat</span>
                            <span className="text-gray-400 dark:text-gray-500 pl-3">Total Visitors</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full border-2 border-blue-400 dark:border-blue-500 mr-2"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">This year</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full border-2 border-gray-400 dark:border-gray-600 mr-2"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">Last year</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between mb-2">
                        <div>30M</div>
                        <div>20M</div>
                        <div>10M</div>
                        <div>0</div>
                    </div>

                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data}>
                            <defs>
                                <linearGradient id="colorThisYear" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                className="dark:text-gray-400"
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value / 1000}K`}
                                hide
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--foreground)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="thisYear"
                                stroke="#60a5fa"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                                fillOpacity={1}
                                fill="url(#colorThisYear)"
                            />
                            <Line
                                type="monotone"
                                dataKey="lastYear"
                                stroke="#000000"
                                strokeWidth={1.5}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={{ r: 6 }}
                                className="dark:stroke-gray-400"
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    <div className="flex items-center justify-center my-2">
                        <div className="bg-blue-500/20 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded text-xs">
                            {data.reduce((sum, item) => sum + item.thisYear, 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 