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
  const events =[]
  // if you can find a way to get the objects to look like the example below, our project works (nearly any permutation of dates works btw)
  // const events = [
  //   {
  //     start: '2023-04-20T09:00:00',
  //     end: '2023-04-20T11:00:00',
  //     event: 'RandomWord1'
  //   },
  //   {
  //     start: '15 April 2023 14:48',
  //     end: '15 April 2023 16:48',
  //     event: 'RandomWord2'
  //   },
  //   {
  //     start: '3/7/23',
  //     end: '2023-04-24T18:00:00',
  //     event: 'RandomWord3'
  //   }
  // ];
  if (events.length == 0){
     events.push({start: start, end: end, event: eventName})
  }
  
  
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
    for (let i = 0; i < events.length; i++) {
    const start = events[i].start;
    const end = events[i].end;
    const eventName = events[i].event;
    const event ={
      "summary": eventName,
      "start":{
        "dateTime": new Date(start).toISOString(),
        "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      "end": {
        "dateTime": new Date(end).toISOString(),
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
  } }
  console.log(start);
  console.log(eventName);

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
        <input type="text" onChange={(e)=>setStart(e.target.value)}/>
        <p>End Date/Time</p>
        <input type="text" onChange={(e)=>setEnd(e.target.value)}/>
        <p>Event Name</p>
        <input type="text" onChange={(e)=>setEventName(e.target.value)}/>
        <button onClick={()=> createCalenderEvent()}>Create Event</button>
        </div>


        <div className="upload_files">
        <button className="file_button" onClick={()=> createCalenderEvent()}> Second Create Event</button>
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
