import ContentSection from "@/pages/settings/components/content-section";
import { Button } from "@/components/custom/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface Automation {
    id: string;
    name: string;
    status: boolean;
    type: "instant-reply" | "faq" | "training";
}

export default function AutomationSMS() {
    const [automations, setAutomations] = useState<Automation[]>([
        { id: "1", name: "Frequently Asked Questions 1", status: true, type: "faq" },
        { id: "2", name: "Instant Reply", status: false, type: "instant-reply" },
        { id: "3", name: "Frequently Asked Questions 2", status: true, type: "faq" },
        { id: "4", name: "Training A", status: false, type: "training" },
    ]);

    const toggleStatus = (id: string) => {
        setAutomations(automations.map(automation =>
            automation.id === id
                ? { ...automation, status: !automation.status }
                : automation
        ));
    };

    return (
        <div className="mx-6 mt-4">
            <ContentSection title="Automation SMS">
                <div className="space-y-6">
                    <p className="text-muted-foreground">
                        Set up automations that manage your conversations and streamline your workflows, giving you more time to focus on your business.
                    </p>

                    {/* Automation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Instant Reply Card */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 space-y-4">
                                <img
                                    src="https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747212346/instantReply.png"
                                    alt="Instant Reply"
                                    className="w-full h-28 object-cover rounded-md"
                                />
                                <h3 className="font-medium">Instant Reply</h3>
                                <p className="text-sm text-muted-foreground">
                                    Reply with a greeting when someone messages you for the first time.
                                </p>
                                <Button className="w-full" variant="outline">Create One</Button>
                            </div>
                        </div>

                        {/* FAQs Card */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 space-y-4">
                                <img
                                    src="https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747212404/FAQ.png"
                                    alt="Frequently Asked Questions"
                                    className="w-full h-28 object-cover rounded-md"
                                />
                                <h3 className="font-medium">Frequently Asked Questions</h3>
                                <p className="text-sm text-muted-foreground">
                                    Reply to a message that contains specific keywords.
                                </p>
                                <Button className="w-full" variant="outline">Create One</Button>
                            </div>
                        </div>

                        {/* Trained AI Card */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 space-y-4">
                                <img
                                    src="https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747212425/TrainAi.png"
                                    alt="Trained AI"
                                    className="w-full h-28 object-cover rounded-md"
                                />
                                <h3 className="font-medium">Trained AI</h3>
                                <p className="text-sm text-muted-foreground">
                                    You could train your AI about your business and chat with your clients.
                                </p>
                                <Button className="w-full" variant="outline">Start Training</Button>
                            </div>
                        </div>
                    </div>

                    {/* Your Automations Section */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium">Your Automations</h3>
                        <div className="mt-4 space-y-4">
                            <div className="relative">
                                <Input placeholder="Search" className="pl-8" />
                                <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.3-4.3"></path>
                                </svg>
                            </div>

                            {/* Automations Table */}
                            <div className="overflow-hidden rounded-md border">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {automations.map((automation, index) => (
                                            <tr key={automation.id} className={index % 2 === 1 ? "bg-muted" : ""}>
                                                <td className="px-4 py-3">
                                                    <Switch
                                                        checked={automation.status}
                                                        onCheckedChange={() => toggleStatus(automation.id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm">{automation.name}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="link" className="text-blue-500 h-auto p-0">Edit</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </ContentSection>
        </div>
    );
}
