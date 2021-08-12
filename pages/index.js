import Head from 'next/head'

import firebase from 'firebase/app';
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useRef, useState } from 'react';

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
    <div className="p-6 mx-auto">
        <header className="pb-8 flex justify-between w-full justify-center">
          <h1>Firechat</h1>
          {user && <SignOut />}
        </header>
        <section className="flex justify-center">
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
    <div className="pt-64">
      <button className="py-2 px-4 font-semibold rounded-lg shadow-md text-white bg-black hover:bg-gray-700" onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button className="py-2 px-4 font-semibold rounded-lg shadow-md text-white bg-black hover:bg-gray-700" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function Feed() {
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)

  const dummy = useRef()
  const [messages] = useCollectionData(query, {idField: 'id'})
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault()

    const { uid, photoURL } = auth.currentUser

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')

    dummy.current.scrollIntoView({ behaviour: 'smooth' })
  }

  return (
    <>
    <main>
    {messages && messages.map(msg => <Message key={msg.id} message={msg} />)}
    <div ref={dummy}></div>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
      <button type="submit">Send</button>
    </form>
    </>
  )
}

function Message(props){
  const { text, uid, photoURL } = props.message

  const messageStatus = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className="flex my-4 items-center">
      <img className="rounded-full h-8 w-8" src={photoURL} alt="" />
      <h3>{text}</h3>
    </div>
  )
}