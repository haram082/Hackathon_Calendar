import React from 'react'
import './App.css'
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react'
import DateTimePicker from 'react-datetime-picker'
import {useState} from 'react';




function App() {
  const [start, setStart] = useState(new Date()) //start date
  const [end, setEnd] = useState(new Date()) //end date
  const [eventName, setEventName] = useState("")
  const session = useSession(); //tokens
  const supabase = useSupabaseClient(); //talk to supabase
  const {isLoading} =useSessionContext();
  

  const newstart= new Date("15 April 2023 14:48")
  const newend= new Date("15 April 2023 16:48")
  
  //remove weird flickering when reload
  if(isLoading){
    return <></>
  }
  // sign in function
  async function googleSignIn(){
    const {error} = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if(error){
      alert("Error loggin into Google provider with Supabase")
      console.log(error)
    }
  }
  // sign out function
  async function signout(){
    await supabase.auth.signOut();
  }
  

  // calender event making
  async function createCalenderEvent(){
    const event ={
      "summary": eventName,
      "start":{
        "dateTime": start.toISOString(),
        "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      "end": {
        "dateTime": end.toISOString(),
        "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }
    // fetch and post data
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events",{
      method: "POST",
      headers:{
        'Authorization': "Bearer " + session.provider_token//access token for google
      },
      body: JSON.stringify(event)
    }).then((data)=> {
      return data.json();
    }).then((data)=>{
      console.log(data);
      alert("Event Created!")
    })
  }


  return (
    <div>
    <div className='App'>
        <h1>Google Calendar API</h1>
{/* session = user, if no session = no user */}
        {session ?
        <>
        <h2>Welcome Back, {session.user.email}</h2>
        <div className="sections">
        <div className='add_event'>
        <h3>Add An Event Yourself</h3>
        <p>Start Date/Time</p>
        <DateTimePicker onChange={setStart} value={start} calenderIcon={null}/>
        <p>End Date/Time</p>
        <DateTimePicker onChange={setEnd} value={end}  />
        <p>Event Name</p>
        <input type="text" onChange={(e)=>setEventName(e.target.value)}/>
        <button onClick={()=> createCalenderEvent()}>Create Event</button>
        </div>


        <div className="upload_files">
        <button className="file_button" onClick={()=> createCalenderEvent()}>Create Event</button>
        </div>


        </div>
      <button className="button-arounder" onClick={()=> signout()}>Sign Out</button>
      </>
      :
      <>
      <div className="button_minion"><button className="button-arounder" onClick={()=> googleSignIn()}>Sign In with Google</button>
      <img className="minion" src="minion.png" alt="minion"/></div></>}
    </div>
    </div>
  )
}

export default App
