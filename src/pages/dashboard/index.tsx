import Head from 'next/head'
import styles from './styles.module.css'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { Textarea } from '@/src/components/textarea'
import { FiShare2 } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { db } from '@/src/services/firebaseConnection'
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import Link from 'next/link'

interface HomeProps {
    user: {
        email: string
    }
}

interface TaskProps {
    id: string;
    createdAt: Date;
    task: string;
    public: boolean
    user: string
}

export default function Dashboard({
    user
}: HomeProps) {

    const [input, setInput] = useState("")
    const [publicTask, setPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TaskProps[]>([])

    useEffect(() => {
        async function loadTasks() {
            const tasksRef = collection(db, "tasks")
            const q = query(tasksRef, orderBy("createdAt", "desc"), where("user", "==", user?.email))
            onSnapshot(q, (snapshot) => {
                let list = [] as TaskProps[];
                snapshot.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        task: doc.data().task,
                        createdAt: doc.data().createdAt,
                        public: doc.data().public,
                        user: doc.data().user
                    });
                });
                setTasks(list);
            });
        };
        loadTasks();
    }, [user?.email])

    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked);
    }

    async function handleRegisterTask(event: FormEvent) {
        event.preventDefault();
        if (input === '') {
            return;
        }
        try {
            await addDoc(collection(db, "tasks"), {
                task: input,
                public: publicTask,
                createdAt: new Date(),
                user: user?.email
            });
            setInput("");
            setPublicTask(false);
        } catch (err) {
            console.log(err)
        }
    }

    async function handleShare(id: string){
        await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/task/${id}`);
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "tasks", id);
        await deleteDoc(docRef)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title> Task Panel</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}> Task </h1>
                        <form onSubmit={handleRegisterTask}>
                            <Textarea placeholder='Wash my car today'
                                value={input}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}>
                            </Textarea>
                            <div className={styles.checkboxarea}>
                                <input type='checkbox'
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic}
                                />
                                <label> Public task? </label>
                            </div>
                            <button type='submit' className={styles.button}> Save </button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1> My Tasks </h1>
                    {tasks.map((item) => (
                        <article className={styles.task} key={item.id}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}> Public </label>
                                    <button className={styles.sharedButton} onClick={() => handleShare(item.id)}>
                                        <FiShare2 size={22} color="#3183ff" />
                                    </button>
                                </div>
                            )}
                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p>
                                            {item.task}
                                        </p>
                                    </Link>
                                ) : (
                                    <p>
                                        {item.task}
                                    </p>
                                )}
                                <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash size={24} color="#ea3140" />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req })
    if (!session?.user) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }
    return {
        props: {
            user: {
                email: session?.user?.email
            }
        },
    }
}