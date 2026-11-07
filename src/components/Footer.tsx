// Slim footer in the style of ardoco.de: credits and a link to the ARDoCo introduction video.
// Links open in a new tab so that a running project is not lost.

const linkClass = "text-ardoco-accent underline decoration-ardoco-accent/40 underline-offset-2 hover:text-ardoco-accent-strong";

export default function Footer() {
    return (
        <footer
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-ardoco-border bg-ardoco-bg px-4 py-1.5 text-xs text-ardoco-muted lg:px-8">
            <p>
                ARDoCo is developed by researchers of the{' '}
                <a href="https://mcse.kastel.kit.edu/" className={linkClass} target="_blank" rel="noopener noreferrer">Modelling for Continuous Software Engineering</a>
                {' '}group of{' '}
                <a href="https://kastel.kit.edu/" className={linkClass} target="_blank" rel="noopener noreferrer">KASTEL</a> at the{' '}
                <a href="https://www.kit.edu/" className={linkClass} target="_blank" rel="noopener noreferrer">KIT</a>.
            </p>
            <p>
                Learn what ARDoCo does:{' '}
                <a href="https://ardoco.de/c/ase26-tools" className={linkClass} target="_blank" rel="noopener noreferrer">watch the introduction video</a>
            </p>
        </footer>
    );
}
