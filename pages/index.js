import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import firebase from 'firebase/app';
import 'firebase/firestore'
import 'firebase/auth'

export default function Home() {
  return (
    <div className={styles.container}>
        <h1>Welcome to my virtual guestbook!</h1>
    </div>
  )
}
