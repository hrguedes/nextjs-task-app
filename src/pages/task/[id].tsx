import Head from 'next/head'
import styles from './styles.module.css'
import { GetServerSideProps } from 'next'
import { db } from '@/src/services/firebaseConnection'
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { Textarea } from '@/src/components/textarea'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { getSession, useSession } from 'next-auth/react'

interface TaskProps {
    item: {
        id: string;
        createdAt: string;
        task: string;
        public: boolean
        user: string
    }
}

interface CommentProp {
    id: string;
    createdAt: Date;
    comment: string;
    idTask: string;
    user: string;
}

export default function Task({ item }: TaskProps) {
    const [comment, setComment] = useState("")
    const [comments, setComments] = useState<CommentProp[]>([])
    const { data: session, status } = useSession();

    useEffect(() => {
        async function loadComments() {
            const commentRef = collection(db, "comments")
            const q = query(commentRef, orderBy("createdAt", "desc"), where("idTask", "==", item.id))
            onSnapshot(q, (snapshot) => {
                let list = [] as CommentProp[];
                snapshot.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        comment: doc.data().comment,
                        createdAt: doc.data().createdAt,
                        user: doc.data().user,
                        idTask: doc.data().idTask
                    });
                });
                setComments(list);
            });
        };
        loadComments();
    }, [item.id])

    async function handlerRegisterComment(event: FormEvent) {
        event.preventDefault();
        if (comment === "") {
            return;
        }
        try {
            await addDoc(collection(db, "comments"), {
                comment: comment,
                createdAt: new Date(),
                user: session?.user?.email,
                idTask: item.id
            });
            setComment("");
        } catch (err) {
            console.log(err)
        }
    }


    return (
        <div className={styles.container}>
            <Head>
                <title> Details </title>
            </Head>
            <main className={styles.main}>
                <h1> Task </h1>
                <article className={styles.task}>
                    <p>
                        {item.task}
                    </p>
                </article>
            </main>

            {status === "authenticated" && (
                <section className={styles.commentsContainer}>
                    <h2> Write comment </h2>
                    <form onSubmit={handlerRegisterComment}>
                        <Textarea placeholder='write you comment...'
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)} />
                        <button className={styles.button}> Send </button>
                    </form>
                </section>
            )}

            <section className={styles.commentContainer}>
                <h1> Comments </h1>
                {comments.map((item) => (
                    <article className={styles.comment} key={item.id}>
                        <div className={styles.commentContent}>
                            <p>
                                {item.comment}
                            </p>
                            <p>
                                {item.user}
                            </p>
                        </div>
                    </article>
                ))}
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
    const id = params?.id as string
    const docRef = doc(db, "tasks", id)
    const snapshot = await getDoc(docRef)


    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }
    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    const milisecond = snapshot.data()?.createdAt?.seconds * 1000;
    const task = {
        task: snapshot.data()?.task,
        public: snapshot.data()?.public,
        createdAt: new Date(milisecond).toLocaleDateString(),
        user: snapshot.data()?.user,
        id: id
    }

    return {
        props: {
            item: task
        }
    }
}