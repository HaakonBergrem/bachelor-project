import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-brand-base-950 shadow sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href={"/"}>
                        <img src="/placeholder.jpg" alt="logo" className="mr-auto w-40 shrink-0" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
