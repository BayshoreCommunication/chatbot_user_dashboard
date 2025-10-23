import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandWhatsapp,
} from '@tabler/icons-react'

export const apps = [
  {
    name: 'Facebook',
    logo: <IconBrandFacebook />,
    connected: false,
    desc: 'Connect your Facebook page for social engagement.',
  },
  {
    name: 'Instagram',
    logo: <IconBrandInstagram />,
    connected: false,
    desc: 'Connect Instagram to manage DMs and comments from one place.',
  },
  {
    name: 'X (Twitter)',
    logo: <IconBrandTwitter />,
    connected: false,
    desc: 'Integrate X (Twitter) for mentions and direct messages.',
  },
  {
    name: 'WhatsApp',
    logo: <IconBrandWhatsapp />,
    connected: false,
    desc: 'Easily integrate WhatsApp for direct messaging.',
  },
  {
    name: 'LinkedIn',
    logo: <IconBrandLinkedin />,
    connected: false,
    desc: 'Connect LinkedIn to engage with your professional audience.',
  },
]
