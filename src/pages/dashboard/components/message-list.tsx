import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Message = {
    id: number
    name: string
    message: string
    date: string
}

const messages: Message[] = [
    {
        id: 1,
        name: 'Marco',
        message: 'Hey, I am marco',
        date: '2-4-2025'
    },
    {
        id: 2,
        name: 'Leo David',
        message: 'Hey, I am marco',
        date: '2-4-2025'
    },
    {
        id: 3,
        name: 'Lulch Reyon',
        message: 'Hey, I am marco',
        date: '2-4-2025'
    },
    {
        id: 4,
        name: 'Jhonson',
        message: 'Hey, I am marco',
        date: '2-4-2025'
    },
    {
        id: 5,
        name: 'Mar Wood',
        message: 'Hey, I am marco',
        date: '2-4-2025'
    }
]

export function MessageList() {
    return (
        <Card className="col-span-1 lg:col-span-7 border-none shadow-sm dark:bg-gray-900/40">
            <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-sm font-medium dark:text-gray-300">New Message</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-800">
                                <th className="px-2 py-3">Name</th>
                                <th className="px-2 py-3">Message</th>
                                <th className="px-2 py-3 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((message) => (
                                <tr key={message.id} className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="px-2 py-3 text-sm dark:text-gray-300">{message.name}</td>
                                    <td className="px-2 py-3 text-sm text-gray-600 dark:text-gray-400">{message.message}</td>
                                    <td className="px-2 py-3 text-sm text-right dark:text-gray-400">{message.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
} 