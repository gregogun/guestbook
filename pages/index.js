import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import firebase from 'firebase/app';
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyCq5Gg_9SzIPVyPRDaUFTW797SUSfxp-No",
    authDomain: "guestbook-d36f8.firebaseapp.com",
    projectId: "guestbook-d36f8",
    storageBucket: "guestbook-d36f8.appspot.com",
    messagingSenderId: "888411020306",
    appId: "1:888411020306:web:df8e5b63ea59df0698cccb",
    measurementId: "G-7X1ZLPQQLH"
  })
} else {
  firebase.app()
}

const auth = firebase.auth()
const firestore = firebase.firestore()


export default function Home() {
  const [user] = useAuthState(auth)

  return (
    <div className={styles.container}>
        <h1>Welcome to my virtual guestbook!</h1>
        <section>
          {user ? <Feed /> : <SignIn />}
        </section>
    </div>
  )
}

function SignIn() {
  function signInWithGoogle(){
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function Feed() {
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)

  const [messages] = useCollectionData(query, {idField: 'id'})

  return (
    <div>
    <SignOut />
    {messages && messages.map(msg => <Message key={msg.id} message={msg} />)}
    </div>
  )
}

function Message(props){
  const { text, uid } = props.message
  return (
    <p>{text}</p>
  )
}