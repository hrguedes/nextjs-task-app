import Link from 'next/link'
import styles from './styles.module.css'
import { signIn, signOut, useSession } from 'next-auth/react'

export function Header() {
    const { data: session, status } = useSession();

    return (
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href='/'>
                        <h1 className={styles.logo}>
                            Task App <span>+</span>
                        </h1>
                    </Link>
                    {session?.user && (
                        <Link href="/dashboard" className={styles.link}>
                            Panel
                        </Link>
                    )}
                </nav>
                {status === 'loading' ? (
                    <></>
                ) : session ? (
                    <button className={styles.loginButton} onClick={() => signOut()}>
                        Hi {session?.user?.name}
                    </button>
                ) : (
                    <button className={styles.loginButton} onClick={() => signIn("google")}>
                        Login
                    </button>
                )}
            </section>
        </header>
    )
}