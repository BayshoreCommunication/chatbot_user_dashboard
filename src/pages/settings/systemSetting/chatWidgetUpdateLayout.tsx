import ContentSection from '../components/content-section'
import { ChatWidgetUpdate } from './chatWidgetUpdate'

export default function ChatWidgetUpdateLayout() {
  return (
    <div className='mx-6 mt-4 '>
      <ContentSection title='System Setting'>
        <ChatWidgetUpdate />
      </ContentSection>
    </div>
  )
}
