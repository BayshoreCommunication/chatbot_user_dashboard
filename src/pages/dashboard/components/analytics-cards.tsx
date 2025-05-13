import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AnalyticsCards() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-blue-50 dark:bg-gray-900/40 border-none shadow-none">
                <CardHeader className="pb-0 pt-4 px-5">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Chat</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold dark:text-white">721K</div>
                        <p className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center">
                            <span className="mr-1">+11.02%</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                            >
                                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                            </svg>
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gray-100 dark:bg-gray-900/60 border-none shadow-none">
                <CardHeader className="pb-0 pt-4 px-5">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Visitors</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold dark:text-white">367K</div>
                        <p className="text-xs text-red-500 dark:text-red-400 flex items-center">
                            <span className="mr-1">-0.03%</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                            >
                                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                            </svg>
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-gray-900/40 border-none shadow-none">
                <CardHeader className="pb-0 pt-4 px-5">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">New Users</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold dark:text-white">1,156</div>
                        <p className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center">
                            <span className="mr-1">+15.03%</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                            >
                                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                            </svg>
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gray-100 dark:bg-gray-900/60 border-none shadow-none">
                <CardHeader className="pb-0 pt-4 px-5">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Chat</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold dark:text-white">239K</div>
                        <p className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center">
                            <span className="mr-1">+0.08%</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                            >
                                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                            </svg>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 