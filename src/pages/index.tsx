import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'

// styles
import styles from '@/styles/Home.module.css'

// imgs
import heroImg from '@/public/assets/hero.png'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'

// firebase
import { db } from '@/src/services/firebaseConnection'
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc, getCountFromServer } from 'firebase/firestore'

const inter = Inter({ subsets: ['latin'] })

interface HomeProps {
  totalPosts: number;
  totalComments: number;
}

export default function Home({ totalComments, totalPosts }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Task App</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="logo task app"
            src={heroImg}
            priority
          ></Image>
        </div>
        <h1 className={styles.title}>System for organize you Tasks</h1>
        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span> + {totalComments} Tasks</span>
          </section>
          <section className={styles.box}>
            <span> + {totalPosts} Comments</span>
          </section>
        </div>
      </main>
    </div>
  )
}


export const getServerSideProps: GetServerSideProps = async () => {  
  const comments = collection(db, "comments");
  const tasks = collection(db, "tasks");
  const totalTasks = await getCountFromServer(tasks);
  const totalComments = await getCountFromServer(comments);

  return {
    props: {
      totalPosts: totalTasks.data().count,
      totalComments: totalComments.data().count
    },
  }
}
