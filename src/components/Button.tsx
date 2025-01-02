'use client'

interface Props {
    text: string;
    onButtonClicked?: () => void;
}


function Button({text, onButtonClicked }:Props) {

    if (onButtonClicked) {
        return (<button className="mt-10 flex items-center justify-center gap-x-6" onClick={onButtonClicked}>{text} </button>);
    } else {
        return (<button className="mt-10 flex items-center justify-center gap-x-6"> {text} </button>);
    }
}

export default Button;