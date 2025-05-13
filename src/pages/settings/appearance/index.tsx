import { AppearanceForm } from './appearance-form'
import ContentSection from '../components/content-section'
import AppearanceColor from './appearance-color'


export default function SettingsAppearance() {
  return (
    <ContentSection
      title='Appearance'
      desc='Customize the appearance of the app. Automatically switch between day
          and night themes.'
    >
      <>
        <AppearanceColor />
        <AppearanceForm />
      </>


    </ContentSection>
  )
}
