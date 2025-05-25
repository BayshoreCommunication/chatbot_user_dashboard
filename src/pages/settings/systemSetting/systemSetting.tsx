import { Button } from '@/components/custom/button'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

export function SystemSetting() {
  const navigate = useNavigate()

  const handleInstallClick = () => {
    navigate('/dashboard/chat-widget-setup')
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-120px)]">
      <div className="flex-1 overflow-y-auto pr-4 space-y-6 pb-6">
        {/* Chat Widget Section */}
        <div>
          <h3 className="text-xl font-medium">Set up the chat widget</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Set up a chat widget to streamline communication, improve customer satisfaction, and drive conversations
            with real-time assistance.
          </p>

          <Card className=" pt-3 pb-8 pl-6 pr-12  flex flex-col items-center justify-center space-y-6 border rounded-lg">
            <div className="relative w-full max-w-xs mx-auto">
              <div className="flex justify-center">


                <img className='ml-16' src="https://res.cloudinary.com/dq9yrj7c9/image/upload/v1747201869/v4rdwnsadrzqzsi6mlkm.png" alt="" />

              </div>
            </div>

            <div className="text-center mt-4 space-y-2">
              <h4 className="text-2xl font-medium flex items-center justify-center gap-2">
                Add <span className="font-bold">Bay AI</span> to your website
              </h4>
              <p className="text-sm text-muted-foreground max-w-md">
                Installing chat widget is essential for engaging customers with
                live chat, activating our Flows and AI support features.
              </p>
            </div>

            <Button
              variant="default"
              className="bg-black text-white rounded-md px-6 py-2 mt-4 flex items-center gap-2"
              onClick={handleInstallClick}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Install Bay AI on your website
            </Button>
          </Card>
        </div>
      </div>

    </div>
  )
}
