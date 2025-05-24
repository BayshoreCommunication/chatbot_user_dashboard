import { AppearanceForm } from './appearance-form'
import ContentSection from '../components/content-section'
import AppearanceColor from './appearance-color'


export default function SettingsAppearance() {
  return (
    <ContentSection
      title='Appearance'
    >
      <>
        <AppearanceColor />
        <AppearanceForm />
      </>


    </ContentSection>
  )
}
