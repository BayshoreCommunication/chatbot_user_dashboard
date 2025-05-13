import { Separator } from '@/components/ui/separator'
import { ThemeColorContext } from '@/context/ThemeColorContext';
import { useContext } from 'react';

interface ContentSectionProps {
  title: string
  desc: string
  children: JSX.Element
}


export default function ContentSection({
  title,
  desc,
  children,
}: ContentSectionProps) {

  const { textColor1, textColor2 } = useContext(ThemeColorContext);

  return (
    <div className={`flex flex-1 flex-col `}>
      <div className='flex-none'>
        <h3 className={`text-lg font-medium ${textColor1}`}>{title}</h3>
        <p className={`text-sm text-muted-foreground ${textColor2} `}>{desc}</p>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom -mx-4 flex-1 overflow-auto scroll-smooth px-4 md:pb-16'>
        <div className='lg:max-w-xl'>{children}</div>
      </div>
    </div>
  )
}
