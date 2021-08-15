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
    <div className="mx-auto">
        <header className="bg-white fixed top-0 p-4 flex justify-between w-full justify-center border-b-2 border-gray-100">
          <h1 className="text-2xl"><span>🔥</span> Firechat</h1>
          {user && <SignOut />}
        </header>
          {user ? <Feed /> : <SignIn />}
    </div>
  )
}

function SignIn() {
  function signInWithGoogle(){
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  return (
    <div className="w-full pt-64 flex">
      <button className="py-2 px-4 mx-auto display-block font-semibold shadow-md text-white bg-black hover:bg-gray-700 rounded-md" onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button className="py-2 px-4 font-semibold shadow-md text-white bg-black hover:bg-gray-800 rounded-md" onClick={() => auth.signOut()}>Sign Out</button>
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
    <section className="my-12">
      <main className="p-4 h-4/5 overflow-scroll">
        {messages && messages.map(msg => <Message key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form className="bg-gray-500 w-full flex justify-between fixed bottom-0" onSubmit={sendMessage}>
        <input className="h-16 w-4/5 rounded-none bg-gray-200 px-2 text-lg" placeholder="Share something nice here :)" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button disabled={!formValue} className={`disabled:opacity-50 disabled:cursor-not-allowed rounded-none h-16 w-1/5 py-2 px-4 font-semibold shadow-md text-white bg-blue-500 rounded-none text-lg`} type="submit">Send <span>🕊</span></button>
      </form>
    </section>
  )
}

function Message(props){
  const { text, uid, photoURL } = props.message

  const messageStatus = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={`flex my-6 items-center ${messageStatus === 'sent' ? 'flex-row-reverse' : 'flex-row'}`}>
      <img className="rounded-full h-14 w-14 mr-2" src={photoURL} alt="" />
      <div className={`${messageStatus === 'sent' ? 'p-4 bg-black text-white rounded-l-full rounded-tr-full' : 'p-4 bg-gray-200 rounded-r-full rounded-tl-full'} mr-2`}>
        <h3 className="text-md">{text}</h3>
      </div>
    </div>
  )
}