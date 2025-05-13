
interface HeaderSectionProps {
    title: string;
    subTitle: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ title, subTitle }) => {

    return (
        <div className='space-y-0.5'>
            <h1 className={`text-2xl font-bold tracking-tight md:text-3xl  `}>
                {title}
            </h1>
            <p className='text-muted-foreground'>
                {subTitle}
            </p>
        </div>
    );
};

export default HeaderSection;