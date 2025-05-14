import ContentSection from '../components/content-section'
import { ChatWidgetSetup } from './chatWidgetSetup'

export default function ChatWidgetSetupPage() {
  return (
    <div className='mx-6 mt-4'>
      <ContentSection
        title='Chat Widget Setup'
      >
        <ChatWidgetSetup />
      </ContentSection>
    </div>
  )
} 