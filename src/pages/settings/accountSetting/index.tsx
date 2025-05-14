import ContentSection from '../components/content-section'
import { AccountSetting } from './accountSetting'

export default function SettingsAccount() {
  return (
    <div className='mx-6 mt-4'>
      <ContentSection
        title='Account Setting'
      >
        <AccountSetting />
      </ContentSection>
    </div>
  )
}
