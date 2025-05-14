import ContentSection from '../components/content-section'
import { ChatWidgetInstall } from './chatWidgetInstall'

export default function ChatWidgetInstallPage() {
    return (
        <div className='mx-6 mt-4'>
            <ContentSection
                title='System Setting'
            >
                <ChatWidgetInstall />
            </ContentSection>
        </div>
    )
} 