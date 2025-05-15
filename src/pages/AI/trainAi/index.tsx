import { useState } from "react";
import { Button } from "@/components/custom/button";
import { Input } from "@/components/ui/input";
import { X, Plus, AlertTriangle, Check } from "lucide-react";
import ContentSection from "@/pages/settings/components/content-section";
import { useNavigate } from "react-router-dom";

interface Website {
    id: string;
    url: string;
    status: "Used" | "Pending" | "Failed";
    createdAt: string;
}

export default function TrainAiPage() {
    const navigate = useNavigate();
    // Page state management
    const [currentStep, setCurrentStep] = useState<'initial' | 'main'>('initial');

    // Modal state management
    const [showRestrictionsModal, setShowRestrictionsModal] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [showActivationModal, setShowActivationModal] = useState(false);

    // Form state
    const [urlInputs, setUrlInputs] = useState<string[]>(["", "", "", ""]);
    const [websites, setWebsites] = useState<Website[]>([
        { id: "1", url: "dresseddelights.com/contact", status: "Used", createdAt: "Apr 1, 11:59 AM" },
        { id: "2", url: "dresseddelights.com/contact", status: "Used", createdAt: "Apr 1, 11:59 AM" },
        { id: "3", url: "dresseddelights.com/contact", status: "Used", createdAt: "Apr 1, 11:59 AM" },
        { id: "4", url: "dresseddelights.com/contact", status: "Used", createdAt: "Apr 1, 11:59 AM" },
        { id: "5", url: "dresseddelights.com/contact", status: "Used", createdAt: "Apr 1, 11:59 AM" },
        { id: "6", url: "dresseddelights.com/contact", status: "Used", createdAt: "Apr 1, 11:59 AM" },
        { id: "7", url: "dresseddelights.com/contact", status: "Used", createdAt: "Apr 1, 11:59 AM" },
    ]);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleStartTraining = () => {
        setShowRestrictionsModal(true);
    };

    const handleAcceptRestrictions = () => {
        setShowRestrictionsModal(false);
        setShowUrlModal(true);
    };

    const handleUrlChange = (index: number, value: string) => {
        const newUrls = [...urlInputs];
        newUrls[index] = value;
        setUrlInputs(newUrls);
    };

    const handleAddWebsite = () => {
        setShowUrlModal(true);
    };

    const handleUrlSubmit = () => {
        // Filter out empty URLs
        const validUrls = urlInputs.filter(url => url.trim() !== "");

        if (validUrls.length > 0) {
            const newWebsites = validUrls.map((url, index) => ({
                id: (websites.length + index + 1).toString(),
                url: url,
                status: "Used" as const,
                createdAt: new Date().toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                })
            }));

            setWebsites([...websites, ...newWebsites]);
            setUrlInputs(["", "", "", ""]);
            setShowUrlModal(false);
            setCurrentStep('main');
            setShowSuccessMessage(true);

            // Hide success message after 3 seconds
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
        }
    };

    const handleAddUrlInput = () => {
        setUrlInputs([...urlInputs, ""]);
    };

    const handleRemoveUrlInput = (index: number) => {
        const newUrls = [...urlInputs];
        newUrls.splice(index, 1);
        setUrlInputs(newUrls);
    };

    const handleActivate = () => {
        setShowActivationModal(true);
    };

    const handleActivationDone = () => {
        // Navigate to AI home page
        navigate("/train-ai");
    };

    return (
        <div className="mx-6 mt-4">
            <ContentSection title="Training your AI">
                <div className="space-y-6">
                    <p className="text-muted-foreground">
                        Build a smarter AI by continuously updating its knowledge and refining its responses to meet customer expectations.
                    </p>

                    {/* Initial Page */}
                    {currentStep === 'initial' && (
                        <div className="flex flex-col lg:flex-row gap-8 mt-8 relative">
                            {/* Brain background image */}
                            <div
                                className="absolute right-0 bottom-0 w-full h-full pointer-events-none opacity-20 z-0"
                                style={{
                                    backgroundImage: "url('https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747281069/Icersuedcjsep0ebqay0.jpg')",
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "right bottom",
                                    backgroundSize: "contain",
                                }}
                            ></div>

                            <div className="flex-1 z-10">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold">Enhance customer support with an AI assistant, <span className="text-gray-900">Bay AI!</span></h2>
                                    <p>Bay AI is a next-generation AI built for customer support, capable of answering up to <span className="font-semibold">85%</span> of customer inquiries.</p>

                                    <div className="space-y-3 mt-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <p>Replies immediately in natural, human-like conversations.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <p>Multilingual conversations.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <p>Powered by various sources: websites, Q&A sets.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <p>Tackle more complicated, specific use-cases with <span className="font-semibold">Bay AI</span> tasks.</p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Button onClick={handleStartTraining} className="bg-black text-white hover:bg-gray-800">
                                            Start Training
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-[450px] z-10">
                                <div className="relative">
                                    <div className="w-full h-full rounded-lg overflow-hidden">
                                        <div className="bg-white rounded-lg p-4 border shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white">
                                                    <span>BA</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Chat with Bay AI</p>
                                                    <p className="text-xs text-gray-500">we reply immediately</p>
                                                </div>
                                            </div>

                                            <div className="mt-6 space-y-4">
                                                <div className="flex justify-end">
                                                    <div className="bg-gray-800 text-white px-4 py-2 rounded-lg max-w-[80%]">
                                                        <p className="text-sm">Hi, yes. David have found it, ask our concierge 👋</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="bg-gray-100 px-4 py-2 rounded-lg max-w-[80%]">
                                                        <p className="text-sm">Thank you for work, see you!</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex items-center">
                                                <input
                                                    type="text"
                                                    placeholder="Type your message here..."
                                                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                                <button className="ml-2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Page (after URL submission) */}
                    {currentStep === 'main' && (
                        <>
                            {/* Header with title and active button */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">All websites: {websites.length}</h3>
                                <Button
                                    onClick={handleActivate}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Active
                                </Button>
                            </div>

                            {/* Websites List */}
                            {websites.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div></div>
                                        <Button onClick={handleAddWebsite} variant="outline" className="flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Add
                                        </Button>
                                    </div>

                                    <div className="border rounded-md overflow-hidden bg-white">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 border-b">
                                                    <th className="w-8 px-4 py-3 text-left">
                                                        <input type="checkbox" className="rounded" />
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-medium text-sm">Name</th>
                                                    <th className="px-4 py-3 text-left font-medium text-sm">Status</th>
                                                    <th className="px-4 py-3 text-left font-medium text-sm">Created at</th>
                                                    <th className="w-8 px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {websites.map((website, index) => (
                                                    <tr key={website.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                        <td className="px-4 py-3">
                                                            <input type="checkbox" className="rounded" />
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{website.url}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-block px-2 py-1 rounded-md text-xs ${website.status === "Used" ? "bg-green-100 text-green-800" :
                                                                website.status === "Failed" ? "bg-red-100 text-red-800" :
                                                                    "bg-yellow-100 text-yellow-800"
                                                                }`}>
                                                                {website.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{website.createdAt}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button className="text-gray-400 hover:text-gray-500">
                                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M12 12V12.01M12 6V6.01M12 18V18.01M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M12 7C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6C11 6.55228 11.4477 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18C11 18.5523 11.4477 19 12 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* URL Input Modal */}
                    {showUrlModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                            <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-auto shadow-lg">
                                <h3 className="text-lg font-medium mb-4">Add website content from URL</h3>
                                <p className="text-sm text-gray-500 mb-6">Training your Bay AI from your website and others</p>

                                <div className="space-y-4">
                                    {urlInputs.map((url, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                placeholder={`Enter URL of your website e.g http://mypage.com/faq`}
                                                value={url}
                                                onChange={(e) => handleUrlChange(index, e.target.value)}
                                                className="flex-1"
                                            />
                                            <button
                                                onClick={() => handleRemoveUrlInput(index)}
                                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAddUrlInput}
                                        className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                                    >
                                        <Plus className="w-4 h-4" />
                                        +Add Website
                                    </button>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowUrlModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUrlSubmit}
                                        className="bg-black text-white hover:bg-gray-800"
                                    >
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Restriction Modal */}
                    {showRestrictionsModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-lg">
                                <div className="flex justify-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                    </div>
                                </div>

                                <h3 className="text-lg font-medium text-center mb-4">Restrictions of Bay AI</h3>

                                <p className="text-sm text-gray-600 mb-4">
                                    Bay AI is explicitly forbidden from being used in the following areas:
                                </p>

                                <p className="text-sm text-gray-600 mb-4">
                                    Weapons and Military, Adult Content, Political Campaigns, Gambling and betting.
                                </p>

                                <p className="text-sm text-gray-600 mb-4">
                                    By clicking the "Accept" button I confirm that I understand and agree to abide by these limitations.
                                </p>

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleAcceptRestrictions}
                                        className="bg-black text-white hover:bg-gray-800"
                                    >
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activation Confirmation Modal */}
                    {showActivationModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-lg">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-6">Bay AI</h2>

                                    <div className="flex justify-center">
                                        <div className="flex gap-1 mb-6">
                                            {Array(20).fill(0).map((_, i) => (
                                                <div key={i} className="w-2 h-2 bg-gray-200 rounded-full"></div>
                                            ))}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-medium mb-4">Bay AI is active now</h3>

                                    <p className="text-sm text-gray-600 mb-6">
                                        The AI support agent can now answer visitor questions using knowledge you provided.
                                    </p>

                                    <h4 className="font-medium text-left mb-2">What's next:</h4>

                                    <div className="space-y-4 text-left mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-gray-500" />
                                            </div>
                                            <p className="text-sm">Control Bay AI conversations in the Inbox/operator view</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-gray-500" />
                                            </div>
                                            <p className="text-sm">Monitor and analyze Bay AI performance</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-gray-500" />
                                            </div>
                                            <p className="text-sm">Continue to enhance Lynn's knowledge to improve its responses</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleActivationDone}
                                        className="bg-black text-white hover:bg-gray-800 w-full"
                                    >
                                        Done
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {showSuccessMessage && (
                        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-md flex items-center gap-2 z-50">
                            <Check className="w-5 h-5" />
                            <span>Websites added successfully!</span>
                        </div>
                    )}
                </div>
            </ContentSection>
        </div>
    );
} 