import ContentSection from '../components/content-section'
import { ChatWidgetCreate } from './chatWidgetCreate'

export default function ChatWidgetCreateLayout() {
  return (
    <div className='mx-6 mt-4 '>
      <ContentSection title='System Setting'>
        <ChatWidgetCreate />
      </ContentSection>
    </div>
  )
}
