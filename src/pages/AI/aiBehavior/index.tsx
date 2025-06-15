import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/custom/button";
import { Textarea } from "@/components/ui/textarea";
import ContentSection from "@/pages/settings/components/content-section";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { useApiKey } from "@/hooks/useApiKey";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/custom/loading-spinner";

interface ChatWidgetSettings {
    name: string;
    selectedColor: string;
    leadCapture: boolean;
    botBehavior: string;
    avatarUrl: string | null;
    is_bot_connected: boolean;
    ai_behavior?: string;
}

export default function AIBehaviorPage() {
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    const { apiKey } = useApiKey();
    const [behavior, setBehavior] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentSettings, setCurrentSettings] = useState<ChatWidgetSettings | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axiosPublic.get('/api/chatbot/settings', {
                    headers: {
                        'X-API-Key': apiKey,
                    }
                });

                if (response.data.status === "success") {
                    setCurrentSettings(response.data.settings);
                    if (response.data.settings.ai_behavior) {
                        setBehavior(response.data.settings.ai_behavior);
                    }
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Failed to load AI behavior settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [apiKey, axiosPublic]);

    const handleSave = async () => {
        if (behavior.length > 400) {
            toast.error('AI behavior text must be 400 characters or less');
            return;
        }

        if (!currentSettings) {
            toast.error('Failed to save: Current settings not loaded');
            return;
        }

        try {
            setSaving(true);
            const response = await axiosPublic.post('/api/chatbot/save-settings', {
                ...currentSettings,
                ai_behavior: behavior
            }, {
                headers: {
                    'X-API-Key': apiKey,
                }
            });

            if (response.data.status === "success") {
                toast.success('AI behavior saved successfully');
                navigate('/dashboard/train-ai');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save AI behavior');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[calc(100vh-120px)] flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading settings..." />
            </div>
        );
    }

    return (
        <div className="mx-6 mt-4">
            <ContentSection title="AI Behavior Settings">
                <div className="space-y-6">
                    <p className="text-muted-foreground">
                        Customize how your AI assistant behaves and responds to users. This will help shape the personality and tone of your AI's responses.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                AI Behavior Description
                            </label>
                            <Textarea
                                value={behavior}
                                onChange={(e) => setBehavior(e.target.value)}
                                placeholder="Describe how you want your AI to behave (max 400 characters)"
                                className="min-h-[200px]"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                {400 - behavior.length} characters remaining
                            </p>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/dashboard/train-ai')}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </ContentSection>
        </div>
    );
} 