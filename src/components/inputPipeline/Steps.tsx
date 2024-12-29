import NavigationButtons, {NavigationButtonsProps} from "@/components/inputPipeline/navigationButtons";

interface StepProps extends NavigationButtonsProps{
    children: React.ReactNode
}

export default function Step({children, link_back, link_to_next, finish}: StepProps) {
    return (
        <div className='flex flex-col justify-between min-h-[200px] sm:w-[100%]'>
            {/*pass various types of input through the children prop*/}
            {children}
            <NavigationButtons link_back={link_back} link_to_next={link_to_next} finish={finish} />
        </div>
    )
}