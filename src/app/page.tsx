import {redirect} from "next/navigation";

// There is no separate landing page: start directly with a new project.
// Information about ARDoCo is linked in the NavBar and the footer.
export default function Home() {
    redirect("/new-project");
}
